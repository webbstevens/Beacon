import json
import os
import re
import ipaddress
import logging
from typing import Optional
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
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
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


# Radar models
class ProductScrapeRequest(BaseModel):
    url: HttpUrl


class PromptCreateRequest(BaseModel):
    product_id: str
    prompt_text: str


class PromptBulkCreateRequest(BaseModel):
    product_id: str
    prompts: list[str]


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


# ─── Radar: Product & Prompt Management (Epic 1) ─── #

@app.post("/api/products/scrape")
async def scrape_product(body: ProductScrapeRequest, authorization: str = Header(...)):
    """
    Scrape a product URL, extract title + context, store in products table.
    """
    user_id = get_user_id_from_token(authorization)
    url = validate_url(str(body.url))

    # Scrape the page
    scraped = await scrape_url(url)

    # Build a compact context string for LLM matching later
    context_parts = []
    if scraped["title"]:
        context_parts.append(scraped["title"])
    if scraped["meta_description"]:
        context_parts.append(scraped["meta_description"])
    if scraped["body_text"]:
        context_parts.append(scraped["body_text"][:2000])
    context = "\n".join(context_parts)

    # Insert into products
    result = (
        supabase.table("products")
        .insert({
            "user_id": user_id,
            "url": url,
            "scraped_title": scraped["title"] or url,
            "scraped_context": context,
        })
        .execute()
    )

    product = result.data[0]
    return {
        "id": product["id"],
        "url": product["url"],
        "scraped_title": product["scraped_title"],
        "created_at": product["created_at"],
    }


@app.get("/api/products")
async def list_products(authorization: str = Header(...)):
    """List all products for the authenticated user."""
    user_id = get_user_id_from_token(authorization)

    result = (
        supabase.table("products")
        .select("id, url, scraped_title, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    return {"products": result.data}


@app.get("/api/products/{product_id}")
async def get_product(product_id: str, authorization: str = Header(...)):
    """Get a single product with its tracked prompts and latest scan results."""
    user_id = get_user_id_from_token(authorization)

    # Fetch product
    prod = (
        supabase.table("products")
        .select("*")
        .eq("id", product_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not prod.data:
        raise HTTPException(status_code=404, detail="Product not found.")

    # Fetch tracked prompts
    prompts = (
        supabase.table("tracked_prompts")
        .select("id, prompt_text, frequency, created_at")
        .eq("product_id", product_id)
        .order("created_at")
        .execute()
    )

    # Fetch latest scan results for each prompt
    prompt_ids = [p["id"] for p in prompts.data]
    scans = []
    if prompt_ids:
        scans_result = (
            supabase.table("scan_results")
            .select("id, prompt_id, model_name, mentioned, position, scanned_at")
            .in_("prompt_id", prompt_ids)
            .order("scanned_at", desc=True)
            .limit(200)
            .execute()
        )
        scans = scans_result.data

    return {
        "product": prod.data,
        "prompts": prompts.data,
        "scans": scans,
    }


@app.delete("/api/products/{product_id}")
async def delete_product(product_id: str, authorization: str = Header(...)):
    """Delete a product (cascades to prompts and scan results)."""
    user_id = get_user_id_from_token(authorization)

    check = (
        supabase.table("products")
        .select("id")
        .eq("id", product_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not check.data:
        raise HTTPException(status_code=404, detail="Product not found.")

    supabase.table("products").delete().eq("id", product_id).execute()
    return {"deleted": True}


@app.get("/api/products/{product_id}/suggest-prompts")
async def suggest_prompts(product_id: str, authorization: str = Header(...)):
    """
    Use Claude to auto-generate the top 5 buyer search prompts
    based on the product's scraped context and keywords.
    """
    user_id = get_user_id_from_token(authorization)

    prod = (
        supabase.table("products")
        .select("*")
        .eq("id", product_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not prod.data:
        raise HTTPException(status_code=404, detail="Product not found.")

    product = prod.data
    context = product.get("scraped_context", "") or ""
    title = product.get("scraped_title", "") or ""
    url = product.get("url", "") or ""

    prompt = f"""You are a search behavior expert. Given the following product/website information, generate exactly 5 realistic buyer search prompts that a potential customer would type into an AI assistant (like ChatGPT, Gemini, or Claude) when looking for this type of product or service.

Product: {title}
URL: {url}
Context:
{context[:2000]}

Rules:
- Write prompts that real buyers would actually ask an AI assistant
- Include a mix of: "best [category]", "top [category] for [use case]", comparison queries, and recommendation queries
- Be specific to the product's niche, not generic
- Each prompt should be 5-15 words
- Return ONLY a JSON array of 5 strings, nothing else

Example format: ["Best project management tools for small teams", "Top alternatives to Asana for startups", ...]"""

    try:
        message = claude.messages.create(
            model="claude-haiku-4-20250514",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )
        text = message.content[0].text.strip()
        # Parse JSON array
        if "```" in text:
            text = text.split("```")[1].replace("json", "").strip()
        suggestions = json.loads(text)
        if not isinstance(suggestions, list):
            suggestions = []
        return {"suggestions": suggestions[:5]}
    except Exception as e:
        logger.error(f"Suggest prompts failed: {e}")
        raise HTTPException(status_code=502, detail="Failed to generate prompt suggestions.")


@app.post("/api/prompts")
async def create_prompts(body: PromptBulkCreateRequest, authorization: str = Header(...)):
    """Add tracked prompts to a product."""
    user_id = get_user_id_from_token(authorization)

    # Verify product ownership
    check = (
        supabase.table("products")
        .select("id")
        .eq("id", body.product_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not check.data:
        raise HTTPException(status_code=404, detail="Product not found.")

    rows = [{"product_id": body.product_id, "prompt_text": p.strip()} for p in body.prompts if p.strip()]
    if not rows:
        raise HTTPException(status_code=400, detail="No valid prompts provided.")

    result = supabase.table("tracked_prompts").insert(rows).execute()
    return {"prompts": result.data}


@app.delete("/api/prompts/{prompt_id}")
async def delete_prompt(prompt_id: str, authorization: str = Header(...)):
    """Delete a tracked prompt."""
    user_id = get_user_id_from_token(authorization)

    # Verify ownership via join
    check = (
        supabase.table("tracked_prompts")
        .select("id, product_id, products(user_id)")
        .eq("id", prompt_id)
        .execute()
    )
    if not check.data:
        raise HTTPException(status_code=404, detail="Prompt not found.")

    product_data = check.data[0].get("products")
    if not product_data or product_data.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized.")

    supabase.table("tracked_prompts").delete().eq("id", prompt_id).execute()
    return {"deleted": True}


# ─── Radar: LLM Scanning Engine (Epic 2) ─── #

async def query_openai(prompt_text: str) -> str:
    """Query OpenAI ChatGPT with a buyer prompt."""
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=503, detail="OpenAI API key not configured.")

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"},
            json={
                "model": "gpt-4o-mini",
                "messages": [{"role": "user", "content": prompt_text}],
                "max_tokens": 1024,
            },
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]


async def query_gemini(prompt_text: str) -> str:
    """Query Google Gemini with a buyer prompt."""
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=503, detail="Gemini API key not configured.")

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json={"contents": [{"parts": [{"text": prompt_text}]}]},
        )
        resp.raise_for_status()
        data = resp.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]


async def query_claude_model(prompt_text: str) -> str:
    """Query Claude with a buyer prompt."""
    message = claude.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt_text}],
    )
    return message.content[0].text


def extract_mention(raw_response: str, scraped_title: str, product_url: str) -> dict:
    """
    Use Claude to determine if the product was mentioned in an LLM response
    and what position it appeared in.
    """
    # Build search terms from the product's title and URL domain
    domain = urlparse(product_url).hostname or ""
    search_terms = f"Product: {scraped_title}\nDomain: {domain}\nURL: {product_url}"

    extraction_prompt = f"""Analyze the following AI response to determine if a specific product/brand was mentioned.

{search_terms}

AI Response to analyze:
\"\"\"
{raw_response[:3000]}
\"\"\"

Respond in JSON format only:
{{
  "mentioned": true/false,
  "position": <integer 1-10 or null if not mentioned — what position was this product/brand recommended at?>
}}

Rules:
- "mentioned" is true if the product name, brand, or domain appears in the response as a recommendation
- "position" is the ordinal rank (1 = first recommendation, 2 = second, etc.)
- If mentioned but not in a ranked list, set position to 1
- If not mentioned at all, set position to null"""

    try:
        result = claude.messages.create(
            model="claude-haiku-4-20250514",
            max_tokens=200,
            messages=[{"role": "user", "content": extraction_prompt}],
        )
        text = result.content[0].text.strip()
        # Parse JSON from the response
        # Handle cases where Claude wraps it in ```json blocks
        if "```" in text:
            text = text.split("```")[1].replace("json", "").strip()
        parsed = json.loads(text)
        return {
            "mentioned": bool(parsed.get("mentioned", False)),
            "position": parsed.get("position"),
        }
    except Exception as e:
        logger.warning(f"Extraction failed: {e}")
        return {"mentioned": False, "position": None}


@app.post("/api/scan/{product_id}")
async def run_scan(product_id: str, authorization: str = Header(...)):
    """
    Run a visibility scan for all tracked prompts on a product.
    Queries ChatGPT, Gemini, and Claude, then stores results.
    """
    user_id = get_user_id_from_token(authorization)

    # Fetch product
    prod = (
        supabase.table("products")
        .select("*")
        .eq("id", product_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not prod.data:
        raise HTTPException(status_code=404, detail="Product not found.")

    product = prod.data

    # Fetch tracked prompts
    prompts = (
        supabase.table("tracked_prompts")
        .select("id, prompt_text")
        .eq("product_id", product_id)
        .execute()
    )
    if not prompts.data:
        raise HTTPException(status_code=400, detail="No tracked prompts. Add prompts before scanning.")

    results = []
    models = []

    # Build list of available models
    if OPENAI_API_KEY:
        models.append(("chatgpt", query_openai))
    if GEMINI_API_KEY:
        models.append(("gemini", query_gemini))
    if ANTHROPIC_API_KEY:
        models.append(("claude", query_claude_model))

    if not models:
        raise HTTPException(status_code=503, detail="No LLM API keys configured.")

    for prompt in prompts.data:
        for model_name, query_fn in models:
            try:
                raw_response = await query_fn(prompt["prompt_text"])
                extraction = extract_mention(
                    raw_response,
                    product.get("scraped_title", ""),
                    product.get("url", ""),
                )

                scan_row = {
                    "prompt_id": prompt["id"],
                    "model_name": model_name,
                    "mentioned": extraction["mentioned"],
                    "position": extraction["position"],
                    "raw_response": raw_response[:5000],  # cap storage
                }

                supabase.table("scan_results").insert(scan_row).execute()
                results.append({**scan_row, "prompt_text": prompt["prompt_text"]})

            except Exception as e:
                logger.error(f"Scan failed for {model_name}/{prompt['id']}: {e}")
                results.append({
                    "prompt_id": prompt["id"],
                    "prompt_text": prompt["prompt_text"],
                    "model_name": model_name,
                    "error": str(e),
                })

    return {"scan_results": results}


@app.post("/api/scan/cron")
async def cron_scan(authorization: str = Header(...)):
    """
    Run scans for ALL products belonging to the user.
    Designed to be called by an external cron service.
    """
    user_id = get_user_id_from_token(authorization)

    products = (
        supabase.table("products")
        .select("id")
        .eq("user_id", user_id)
        .execute()
    )

    total_scanned = 0
    for prod in products.data:
        try:
            # Reuse the single-product scan logic
            result = await run_scan(prod["id"], authorization)
            total_scanned += len(result.get("scan_results", []))
        except Exception as e:
            logger.error(f"Cron scan failed for product {prod['id']}: {e}")

    return {"products_scanned": len(products.data), "total_results": total_scanned}


# ─── Radar: Dashboard Data (Epic 3) ─── #

@app.get("/api/dashboard/visibility")
async def dashboard_visibility(authorization: str = Header(...)):
    """
    Get visibility scores for all products. Returns each product
    with its overall mention rate across all models and prompts.
    """
    user_id = get_user_id_from_token(authorization)

    # Get all products
    products = (
        supabase.table("products")
        .select("id, url, scraped_title, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    dashboard_data = []
    for prod in products.data:
        # Get prompts for this product
        prompts = (
            supabase.table("tracked_prompts")
            .select("id")
            .eq("product_id", prod["id"])
            .execute()
        )
        prompt_ids = [p["id"] for p in prompts.data]

        total_scans = 0
        total_mentioned = 0
        model_scores = {}

        if prompt_ids:
            scans = (
                supabase.table("scan_results")
                .select("model_name, mentioned")
                .in_("prompt_id", prompt_ids)
                .execute()
            )

            for scan in scans.data:
                total_scans += 1
                if scan["mentioned"]:
                    total_mentioned += 1

                model = scan["model_name"]
                if model not in model_scores:
                    model_scores[model] = {"total": 0, "mentioned": 0}
                model_scores[model]["total"] += 1
                if scan["mentioned"]:
                    model_scores[model]["mentioned"] += 1

        visibility_score = round((total_mentioned / total_scans * 100), 1) if total_scans > 0 else 0

        per_model = {}
        for model, data in model_scores.items():
            per_model[model] = round((data["mentioned"] / data["total"] * 100), 1) if data["total"] > 0 else 0

        dashboard_data.append({
            "id": prod["id"],
            "url": prod["url"],
            "scraped_title": prod["scraped_title"],
            "created_at": prod["created_at"],
            "prompt_count": len(prompt_ids),
            "scan_count": total_scans,
            "visibility_score": visibility_score,
            "per_model": per_model,
        })

    return {"products": dashboard_data}
