"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Sparkles,
  Copy,
  Download,
  Trash2,
  Check,
  Clock,
  ExternalLink,
  Globe,
  FileText,
  Server,
} from "lucide-react";
import {
  generateLlmsTxt,
  listGenerations,
  deleteGeneration,
  type Generation,
} from "@/lib/api";

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Generation | null>(null);
  const [editedMarkdown, setEditedMarkdown] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<Generation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const gens = await listGenerations();
      setHistory(gens);
    } catch {
      // Silently fail for history — not critical
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const gen = await generateLlmsTxt(url);
      setResult(gen);
      setEditedMarkdown(gen.markdown);
      // Refresh history
      loadHistory();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(editedMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([editedMarkdown], { type: "text/plain" });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "llms.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteGeneration(id);
      setHistory((prev) => prev.filter((g) => g.id !== id));
      if (result?.id === id) {
        setResult(null);
        setEditedMarkdown("");
      }
    } catch {
      // Could add toast here
    } finally {
      setDeletingId(null);
    }
  }

  function handleLoadFromHistory(gen: Generation) {
    setResult(gen);
    setEditedMarkdown(gen.markdown);
    setUrl(gen.url);
    setError(null);
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="dashboard-container">
      {/* ─── Main Column ─── */}
      <div className="dashboard-main">
        {/* Generate Card */}
        <Card className="dashboard-card" id="generate-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-blue-400" />
              Generate llms.txt
            </CardTitle>
            <CardDescription>
              Enter your website URL and we&apos;ll crawl it and generate an
              optimized llms.txt file for AI agents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4" id="generate-form">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-10"
                    id="url-input"
                  />
                </div>
                <Button type="submit" disabled={loading} id="generate-btn">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive" id="error-message">
                  {error}
                </div>
              )}

              {loading && (
                <div className="flex items-center gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-300" id="loading-state">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  <div>
                    <p className="font-medium">Scraping &amp; generating…</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This usually takes 10–20 seconds. We&apos;re crawling the
                      page and using AI to create your llms.txt.
                    </p>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Editor Card */}
        {result && (
          <Card className="dashboard-card" id="editor-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-blue-400" />
                  llms.txt
                  <span className="text-xs font-normal text-muted-foreground ml-2">
                    {result.url}
                  </span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    id="copy-btn"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-1.5 h-3.5 w-3.5 text-green-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    id="download-btn"
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download
                  </Button>
                </div>
              </div>
              <CardDescription>
                Edit the generated content below before copying or downloading.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editedMarkdown}
                onChange={(e) => setEditedMarkdown(e.target.value)}
                className="min-h-[400px] font-mono text-sm leading-relaxed"
                id="markdown-editor"
              />
            </CardContent>
          </Card>
        )}

        {/* Hosting Instructions */}
        {result && (
          <Card className="dashboard-card" id="hosting-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Server className="h-5 w-5 text-blue-400" />
                Hosting Instructions
              </CardTitle>
              <CardDescription>
                How to deploy your llms.txt so AI agents can find it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                    1
                  </span>
                  Save the file
                </h4>
                <p className="text-muted-foreground pl-7">
                  Download the file above and save it as{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                    llms.txt
                  </code>{" "}
                  in your website&apos;s root directory.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                    2
                  </span>
                  Verify the URL
                </h4>
                <p className="text-muted-foreground pl-7">
                  Make sure it&apos;s accessible at{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                    {result.url}/llms.txt
                  </code>
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                    3
                  </span>
                  Common placements
                </h4>
                <div className="pl-7 space-y-1 text-muted-foreground">
                  <p>
                    <strong>Static sites:</strong> Place in your{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                      public/
                    </code>{" "}
                    or root folder.
                  </p>
                  <p>
                    <strong>Shopify:</strong> Go to Settings → Files → Upload{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                      llms.txt
                    </code>
                    , then add a URL redirect from{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                      /llms.txt
                    </code>{" "}
                    to the file URL.
                  </p>
                  <p>
                    <strong>WordPress:</strong> Upload to your theme&apos;s root or use a
                    plugin to serve static files.
                  </p>
                  <p>
                    <strong>Next.js / Vite:</strong> Place in the{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                      public/
                    </code>{" "}
                    directory.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ─── Sidebar: History ─── */}
      <aside className="dashboard-sidebar" id="history-sidebar">
        <Card className="dashboard-card sticky top-20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-400" />
              Generation History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading…
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No generations yet. Enter a URL above to get started.
              </p>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                {history.map((gen) => (
                  <div
                    key={gen.id}
                    className={`group flex items-start gap-2 rounded-lg border p-3 text-sm cursor-pointer transition-colors hover:bg-accent/50 ${
                      result?.id === gen.id
                        ? "border-blue-500/40 bg-blue-500/5"
                        : "border-border"
                    }`}
                    onClick={() => handleLoadFromHistory(gen)}
                    id={`history-item-${gen.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-foreground font-medium truncate">
                        <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <span className="truncate">
                          {new URL(gen.url).hostname}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(gen.created_at)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(gen.id);
                      }}
                      disabled={deletingId === gen.id}
                    >
                      {deletingId === gen.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
