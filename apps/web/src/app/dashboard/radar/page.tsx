"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Radar,
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import {
  scrapeProduct,
  getDashboardVisibility,
  deleteProduct,
  type DashboardProduct,
} from "@/lib/radar-api";

function VisibilityBadge({ score }: { score: number }) {
  let color = "text-red-400 bg-red-400/10 border-red-400/30";
  if (score >= 70) color = "text-green-400 bg-green-400/10 border-green-400/30";
  else if (score >= 40)
    color = "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color}`}
    >
      {score}%
    </span>
  );
}

function ModelBadge({
  model,
  score,
}: {
  model: string;
  score: number;
}) {
  const labels: Record<string, string> = {
    chatgpt: "ChatGPT",
    gemini: "Gemini",
    claude: "Claude",
  };

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground">{labels[model] || model}:</span>
      <VisibilityBadge score={score} />
    </div>
  );
}

export default function RadarPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      const data = await getDashboardVisibility();
      setProducts(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleScrape(e: React.FormEvent) {
    e.preventDefault();
    setScraping(true);
    setError(null);

    try {
      const product = await scrapeProduct(url);
      setUrl("");
      // Navigate to the product setup page to add prompts
      router.push(`/dashboard/radar/${product.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to scrape URL."
      );
    } finally {
      setScraping(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-4">
      {/* Add Product */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radar className="h-5 w-5 text-blue-400" />
            AI Visibility Radar
          </CardTitle>
          <CardDescription>
            Track how visible your product is across ChatGPT, Gemini, and
            Claude. Paste a product URL to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleScrape} className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="https://yourproduct.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  disabled={scraping}
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={scraping}>
                {scraping ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-lg">Tracked Products</CardTitle>
          <CardDescription>
            Your products and their AI visibility scores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading...
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Radar className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">
                No products tracked yet. Add a URL above to start monitoring.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-colors hover:bg-accent/50"
                  onClick={() =>
                    router.push(`/dashboard/radar/${product.id}`)
                  }
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm truncate">
                        {product.scraped_title}
                      </h3>
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.prompt_count} prompts &middot;{" "}
                      {product.scan_count} scans
                    </p>

                    {/* Per-model scores */}
                    {Object.keys(product.per_model).length > 0 && (
                      <div className="flex items-center gap-3 mt-2">
                        {Object.entries(product.per_model).map(
                          ([model, score]) => (
                            <ModelBadge
                              key={model}
                              model={model}
                              score={score}
                            />
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {/* Overall score */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Visibility
                      </p>
                      <VisibilityBadge score={product.visibility_score} />
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(product.id);
                      }}
                      disabled={deletingId === product.id}
                    >
                      {deletingId === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      )}
                    </Button>

                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
