"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
  ArrowLeft,
  Plus,
  Trash2,
  Play,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import {
  getProduct,
  createPrompts,
  deletePrompt,
  runScan,
  type ProductDetail,
  type ScanResult,
} from "@/lib/radar-api";

const MODEL_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  claude: "Claude",
};

function MentionBadge({
  mentioned,
  position,
}: {
  mentioned: boolean;
  position: number | null;
}) {
  if (mentioned) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-400/30 bg-green-400/10 px-2 py-0.5 text-xs font-semibold text-green-400">
        <Check className="h-3 w-3" />
        {position ? `#${position}` : "Yes"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-xs font-semibold text-red-400">
      <X className="h-3 w-3" />
      No
    </span>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [data, setData] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prompt input
  const [promptInputs, setPromptInputs] = useState<string[]>(["", "", ""]);
  const [addingPrompts, setAddingPrompts] = useState(false);

  // Scanning
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);

  // Deleting prompts
  const [deletingPromptId, setDeletingPromptId] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    try {
      const detail = await getProduct(productId);
      setData(detail);
    } catch {
      setError("Product not found.");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  async function handleAddPrompts(e: React.FormEvent) {
    e.preventDefault();
    const validPrompts = promptInputs.filter((p) => p.trim());
    if (validPrompts.length === 0) return;

    setAddingPrompts(true);
    try {
      await createPrompts(productId, validPrompts);
      setPromptInputs(["", "", ""]);
      await loadProduct();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add prompts."
      );
    } finally {
      setAddingPrompts(false);
    }
  }

  async function handleDeletePrompt(promptId: string) {
    setDeletingPromptId(promptId);
    try {
      await deletePrompt(promptId);
      await loadProduct();
    } catch {
      // silent
    } finally {
      setDeletingPromptId(null);
    }
  }

  async function handleRunScan() {
    setScanning(true);
    setScanResults([]);
    try {
      const result = await runScan(productId);
      setScanResults(result.scan_results);
      // Reload to show updated data
      await loadProduct();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Scan failed."
      );
    } finally {
      setScanning(false);
    }
  }

  function updatePromptInput(index: number, value: string) {
    setPromptInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function addPromptField() {
    setPromptInputs((prev) => [...prev, ""]);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading product...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-4xl py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/radar")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Radar
        </Button>
        <p className="text-center text-muted-foreground mt-8">
          {error || "Product not found."}
        </p>
      </div>
    );
  }

  const { product, prompts, scans } = data;

  // Build a lookup: promptId -> { model -> latest scan }
  const scansByPrompt: Record<string, Record<string, ScanResult>> = {};
  for (const scan of scans) {
    if (!scansByPrompt[scan.prompt_id]) {
      scansByPrompt[scan.prompt_id] = {};
    }
    // Only keep the latest scan per model per prompt
    const existing = scansByPrompt[scan.prompt_id][scan.model_name];
    if (!existing || scan.scanned_at > existing.scanned_at) {
      scansByPrompt[scan.prompt_id][scan.model_name] = scan;
    }
  }

  // Get unique model names from scans
  const models = [...new Set(scans.map((s) => s.model_name))].sort();

  // Compute overall visibility
  const totalScans = scans.length;
  const totalMentioned = scans.filter((s) => s.mentioned).length;
  const overallScore =
    totalScans > 0 ? Math.round((totalMentioned / totalScans) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/radar")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold truncate">
            {product.scraped_title}
          </h2>
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            {product.url}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        {totalScans > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Overall Visibility</p>
            <span
              className={`text-2xl font-bold ${
                overallScore >= 70
                  ? "text-green-400"
                  : overallScore >= 40
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {overallScore}%
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 h-6"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Add Prompts (Epic 1.3) */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-lg">Target Prompts</CardTitle>
          <CardDescription>
            Add buyer prompts to track — e.g. &quot;Best running shoes for flat
            feet&quot; or &quot;Top CRM tools for startups&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddPrompts} className="space-y-3">
            {promptInputs.map((val, i) => (
              <Input
                key={i}
                type="text"
                placeholder={`Prompt ${i + 1} — e.g. "Best ${
                  i === 0
                    ? "tools"
                    : i === 1
                    ? "alternatives"
                    : "solutions"
                } for..."`}
                value={val}
                onChange={(e) => updatePromptInput(i, e.target.value)}
                disabled={addingPrompts}
              />
            ))}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPromptField}
                disabled={addingPrompts}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add field
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  addingPrompts ||
                  promptInputs.every((p) => !p.trim())
                }
              >
                {addingPrompts ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Save Prompts"
                )}
              </Button>
            </div>
          </form>

          {/* Existing prompts */}
          {prompts.length > 0 && (
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Active Prompts ({prompts.length})
              </h4>
              {prompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="group flex items-center gap-2 rounded border p-2 text-sm"
                >
                  <span className="flex-1 truncate">{prompt.prompt_text}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={() => handleDeletePrompt(prompt.id)}
                    disabled={deletingPromptId === prompt.id}
                  >
                    {deletingPromptId === prompt.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Run Scan */}
      {prompts.length > 0 && (
        <Card className="dashboard-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Radar className="h-5 w-5 text-blue-400" />
                  Visibility Scan
                </CardTitle>
                <CardDescription>
                  Query ChatGPT, Gemini, and Claude with your prompts to check
                  if they recommend your product.
                </CardDescription>
              </div>
              <Button onClick={handleRunScan} disabled={scanning}>
                {scanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Scan
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {scanning && (
            <CardContent>
              <div className="flex items-center gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-300">
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                <div>
                  <p className="font-medium">Scanning across AI models...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Querying {prompts.length} prompt(s) across available models.
                    This may take 30-60 seconds.
                  </p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Results Table (Epic 3.2) */}
      {prompts.length > 0 && models.length > 0 && (
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-lg">Scan Results</CardTitle>
            <CardDescription>
              Latest visibility results per prompt and model.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                      Prompt
                    </th>
                    {models.map((model) => (
                      <th
                        key={model}
                        className="text-center py-2 px-3 font-medium text-muted-foreground"
                      >
                        {MODEL_LABELS[model] || model}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {prompts.map((prompt) => (
                    <tr key={prompt.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 max-w-[300px] truncate">
                        {prompt.prompt_text}
                      </td>
                      {models.map((model) => {
                        const scan =
                          scansByPrompt[prompt.id]?.[model];
                        return (
                          <td key={model} className="py-3 px-3 text-center">
                            {scan ? (
                              <MentionBadge
                                mentioned={scan.mentioned}
                                position={scan.position}
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
