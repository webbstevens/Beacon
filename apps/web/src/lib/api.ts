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

export interface Generation {
  id: string;
  url: string;
  markdown: string;
  created_at?: string;
}

export async function generateLlmsTxt(url: string): Promise<Generation> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${API_URL}/api/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Generation failed (${res.status})`);
  }

  return res.json();
}

export async function listGenerations(): Promise<Generation[]> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${API_URL}/api/generations`, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    throw new Error("Failed to load generation history");
  }

  const data = await res.json();
  return data.generations;
}

export async function deleteGeneration(id: string): Promise<void> {
  const headers = await getAuthHeaders();

  const res = await fetch(`${API_URL}/api/generations/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    throw new Error("Failed to delete generation");
  }
}
