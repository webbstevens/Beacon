import os
import re
import ipaddress
import logging
from urllib.parse import urlparse

import anthropic
import httpx
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from supabase import create_client, Client

load_dotenv()

# ─── Config ─── #
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
RATE_LIMIT_PER_DAY = 10

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("beacon-api")

# ─── Clients ─── #
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
claude = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

app = FastAPI(title="Beacon API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Models ─── #
class GenerateRequest(BaseModel):
    url: HttpUrl


class GenerateResponse(BaseModel):
    id: str
    url: str
    markdown: str


# ─── Helpers ─── #
BLOCKED_HOSTS = {"localhost", "127.0.0.1", "0.0.0.0", "::1"}


def validate_url(url: str) -> str:
    """Validate and sanitize a URL, blocking private/local addresses."""
    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail="Only HTTP/HTTPS URLs are allowed.")

    hostname = parsed.hostname or ""

    # Block known local hostnames
    if hostname.lower() in BLOCKED_HOSTS:
        raise HTTPException(status_code=400, detail="Local/private URLs are not allowed.")

    # Block private IP ranges
    try:
        ip = ipaddress.ip_address(hostname)
        if ip.is_private or ip.is_loopback or ip.is_reserved:
            raise HTTPException(status_code=400, detail="Private/reserved IP addresses are not allowed.")
    except ValueError:
        pass  # hostname is a domain, not an IP — that's fine

    # Block common internal patterns
    if re.search(r"(\.local$|\.internal$|\.localhost$)", hostname, re.IGNORECASE):
        raise HTTPException(status_code=400, detail="Internal hostnames are not allowed.")

    return url


def get_user_id_from_token(authorization: str) -> str:
    """Extract user_id by verifying the JWT with Supabase."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header.")

    token = authorization[7:]

    try:
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token.")
        return user_response.user.id
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed.")


def check_rate_limit(user_id: str) -> None:
    """Check if user has exceeded their daily generation limit."""
    try:
        result = supabase.rpc("generation_count_today", {"uid": user_id}).execute()
        count = result.data if isinstance(result.data, int) else 0
        if count >= RATE_LIMIT_PER_DAY:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. You can generate up to {RATE_LIMIT_PER_DAY} files per day.",
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Rate limit check failed (allowing request): {e}")


async def scrape_url(url: str) -> dict:
    """Scrape a URL and extract structured content."""
    headers = {
        "User-Agent": "BeaconBot/1.0 (+https://beacons.up.railway.app)",
        "Accept": "text/html,application/xhtml+xml",
    }

    async with httpx.AsyncClient(follow_redirects=True, timeout=15.0) as client:
        try:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
        except httpx.TimeoutException:
            raise HTTPException(status_code=422, detail="The URL took too long to respond.")
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=422,
                detail=f"The URL returned an error: HTTP {e.response.status_code}",
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=422, detail=f"Could not reach the URL: {e}")

    content_type = response.headers.get("content-type", "")
    if "text/html" not in content_type and "text/plain" not in content_type:
        raise HTTPException(
            status_code=422,
            detail="The URL does not appear to serve HTML content.",
        )

    soup = BeautifulSoup(response.text, "html.parser")

    # Remove script/style/nav/footer noise
    for tag in soup(["script", "style", "noscript", "iframe", "svg"]):
        tag.decompose()

    # Extract structured data
    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    meta_desc = ""
    meta_tag = soup.find("meta", attrs={"name": "description"})
    if meta_tag and meta_tag.get("content"):
        meta_desc = meta_tag["content"].strip()

    # Extract headings
    headings = []
    for level in range(1, 4):
        for h in soup.find_all(f"h{level}"):
            text = h.get_text(strip=True)
            if text:
                headings.append(f"{'#' * level} {text}")

    # Extract main body text
    body_text = soup.get_text(separator="\n", strip=True)
    # Collapse excessive whitespace
    body_text = re.sub(r"\n{3,}", "\n\n", body_text)
    # Truncate to ~8000 chars to stay within Claude context limits
    body_text = body_text[:8000]

    # Extract links
    links = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        link_text = a.get_text(strip=True)
        if href.startswith("http") and link_text and len(link_text) < 100:
            links.append(f"- [{link_text}]({href})")
    links = links[:30]  # Cap at 30 links

    # Check for thin content (SPA warning)
    is_thin = len(body_text.strip()) < 200

    return {
        "title": title,
        "meta_description": meta_desc,
        "headings": headings,
        "body_text": body_text,
        "links": links,
        "is_thin": is_thin,
        "url": url,
    }


def generate_llms_txt(scraped: dict) -> str:
    """Use Claude Haiku 4.5 to generate an optimized llms.txt file."""

    thin_warning = ""
    if scraped["is_thin"]:
        thin_warning = (
            "\n\nWARNING: The scraped content is very thin (likely a JavaScript SPA). "
            "Generate the best llms.txt you can from what's available, but add a comment "
            "noting that the site may need server-side rendering for better AI crawlability."
        )

    prompt = f"""You are an expert at creating llms.txt files — structured markdown documents 
that help AI agents (like ChatGPT, Gemini, Perplexity) understand a website's content, 
purpose, and structure.

Given the following scraped data from {scraped['url']}, generate an optimized llms.txt file.

## Scraped Data

**Title:** {scraped['title']}
**Meta Description:** {scraped['meta_description']}

**Headings:**
{chr(10).join(scraped['headings'][:20]) if scraped['headings'] else '(none found)'}

**Body Content (excerpt):**
{scraped['body_text'][:4000]}

**Links Found:**
{chr(10).join(scraped['links'][:15]) if scraped['links'] else '(none found)'}
{thin_warning}

## Instructions

Generate a well-structured llms.txt file following this format:

1. Start with `# [Site Name]` as the title
2. Add a `> [one-line description]` blockquote summarizing the site
3. Organize content into logical sections using `##` headers
4. Include important links using markdown format: `- [Link Text](URL)`
5. Keep it concise but comprehensive — aim for 50-150 lines
6. Focus on information that would help an AI agent understand:
   - What the company/site does
   - Key products or services
   - Important pages and their purposes
   - Contact or support information
7. Do NOT include navigation boilerplate, cookie notices, or generic footer content
8. Do NOT wrap the output in a code block — output raw markdown only

Output ONLY the llms.txt content, no explanations or preamble."""

    try:
        message = claude.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text
    except anthropic.BadRequestError as e:
        logger.error(f"Claude API error: {e}")
        raise HTTPException(status_code=502, detail=f"AI generation failed: {e.message}")
    except anthropic.APIError as e:
        logger.error(f"Claude API error: {e}")
        raise HTTPException(status_code=502, detail=f"AI service error: {e.message}")
    except Exception as e:
        logger.error(f"Unexpected Claude error: {e}")
        raise HTTPException(status_code=500, detail="AI generation failed unexpectedly.")


def save_generation(user_id: str, url: str, markdown: str) -> str:
    """Save a generation to the Supabase `generations` table and return its ID."""
    result = (
        supabase.table("generations")
        .insert({"user_id": user_id, "url": url, "markdown": markdown})
        .execute()
    )
    return result.data[0]["id"]


# ─── Routes ─── #
@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/generate", response_model=GenerateResponse)
async def generate(body: GenerateRequest, authorization: str = Header(...)):
    """
    Generate an llms.txt file for a given URL.

    Requires Bearer token authentication via Supabase.
    """
    # 1. Authenticate
    user_id = get_user_id_from_token(authorization)

    # 2. Rate limit
    check_rate_limit(user_id)

    # 3. Validate URL
    url = validate_url(str(body.url))

    # 4. Scrape
    logger.info(f"Scraping {url} for user {user_id}")
    scraped = await scrape_url(url)

    # 5. Generate with Claude
    logger.info(f"Generating llms.txt for {url}")
    markdown = generate_llms_txt(scraped)

    # 6. Save to Supabase
    gen_id = save_generation(user_id, url, markdown)
    logger.info(f"Saved generation {gen_id} for user {user_id}")

    return GenerateResponse(id=gen_id, url=url, markdown=markdown)


@app.get("/api/generations")
async def list_generations(authorization: str = Header(...)):
    """List all generations for the authenticated user (newest first)."""
    user_id = get_user_id_from_token(authorization)

    result = (
        supabase.table("generations")
        .select("id, url, created_at, markdown")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )

    return {"generations": result.data}


@app.delete("/api/generations/{generation_id}")
async def delete_generation(generation_id: str, authorization: str = Header(...)):
    """Delete a specific generation."""
    user_id = get_user_id_from_token(authorization)

    # Verify ownership first
    check = (
        supabase.table("generations")
        .select("id")
        .eq("id", generation_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not check.data:
        raise HTTPException(status_code=404, detail="Generation not found.")

    supabase.table("generations").delete().eq("id", generation_id).execute()
    return {"deleted": True}
