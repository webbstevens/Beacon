import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
  };
}

// ─── Types ─── //

export interface Product {
  id: string;
  url: string;
  scraped_title: string;
  created_at: string;
}

export interface TrackedPrompt {
  id: string;
  prompt_text: string;
  frequency: string;
  created_at: string;
}

export interface ScanResult {
  id: string;
  prompt_id: string;
  model_name: string;
  mentioned: boolean;
  position: number | null;
  scanned_at: string;
  prompt_text?: string;
  error?: string;
}

export interface ProductDetail {
  product: Product & { scraped_context: string };
  prompts: TrackedPrompt[];
  scans: ScanResult[];
}

export interface DashboardProduct {
  id: string;
  url: string;
  scraped_title: string;
  created_at: string;
  prompt_count: number;
  scan_count: number;
  visibility_score: number;
  per_model: Record<string, number>;
}

// ─── API Functions ─── //

export async function scrapeProduct(url: string): Promise<Product> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/products/scrape`, {
    method: "POST",
    headers,
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Scrape failed (${res.status})`);
  }
  return res.json();
}

export async function listProducts(): Promise<Product[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/products`, { headers });
  if (!res.ok) throw new Error("Failed to load products");
  const data = await res.json();
  return data.products;
}

export async function getProduct(id: string): Promise<ProductDetail> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/products/${id}`, { headers });
  if (!res.ok) throw new Error("Failed to load product");
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete product");
}

export async function createPrompts(
  productId: string,
  prompts: string[]
): Promise<TrackedPrompt[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/prompts`, {
    method: "POST",
    headers,
    body: JSON.stringify({ product_id: productId, prompts }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Failed to add prompts (${res.status})`);
  }
  const data = await res.json();
  return data.prompts;
}

export async function deletePrompt(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/prompts/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete prompt");
}

export async function runScan(
  productId: string
): Promise<{ scan_results: ScanResult[] }> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/scan/${productId}`, {
    method: "POST",
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Scan failed (${res.status})`);
  }
  return res.json();
}

export async function getDashboardVisibility(): Promise<DashboardProduct[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/api/dashboard/visibility`, { headers });
  if (!res.ok) throw new Error("Failed to load dashboard data");
  const data = await res.json();
  return data.products;
}
