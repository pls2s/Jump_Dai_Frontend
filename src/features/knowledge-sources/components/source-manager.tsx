"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  File,
  FileText,
  Globe2,
  Link2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Progress,
  Textarea,
} from "@/components/ui";
import { initialKnowledgeSources } from "@/data/mock/product";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import { deleteDocument, getDocuments, uploadDocument, type ApiCourseDocument, type ApiDocumentStatus } from "@/features/knowledge-sources/api/document-api";
import { ApiError } from "@/lib/api/api-client";
import { cn } from "@/lib/cn";
import { fetchDemoUrl } from "@/lib/mock/demo-services";
import { readMockSources, writeMockSources } from "@/lib/mock/source-store";
import type { KnowledgeSource, SourceStatus, SourceType } from "@/types/product";

export type SourceAddMode = "file" | "text" | "url";
type Feedback = { tone: "error" | "success"; text: string };

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const allowedExtensions = ["pdf", "doc", "docx", "ppt", "pptx"];

const statusConfig: Record<SourceStatus, { variant: "info" | "warning" | "success" | "error"; icon: typeof CheckCircle2 }> = {
  Uploading: { variant: "info", icon: UploadCloud },
  Uploaded: { variant: "info", icon: CheckCircle2 },
  Processing: { variant: "warning", icon: RefreshCw },
  Ready: { variant: "success", icon: CheckCircle2 },
  Failed: { variant: "error", icon: AlertTriangle },
};

function sourceTypeFor(fileName: string): SourceType {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "PDF";
  if (["ppt", "pptx"].includes(extension ?? "")) return "Slide";
  return "Document";
}

function humanFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const apiStatusToSourceStatus: Record<ApiDocumentStatus, SourceStatus> = {
  UPLOADED: "Uploaded",
  PROCESSING: "Processing",
  READY: "Ready",
  FAILED: "Failed",
};

function sourceFromApi(document: ApiCourseDocument): KnowledgeSource {
  return {
    id: `document-${document.id}`,
    name: document.filename,
    type: sourceTypeFor(document.filename),
    meta: typeof document.size === "number" ? humanFileSize(document.size) : document.file_type?.toUpperCase() ?? "Backend document",
    status: apiStatusToSourceStatus[document.status],
    updatedAt: "From backend",
  };
}

export function SourceManager({ courseId, initialMode = "file" }: { courseId: string; initialMode?: SourceAddMode }) {
  const router = useRouter();
  const backendCourseId = /^\d+$/.test(courseId) ? Number(courseId) : null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<number[]>([]);
  const [sources, setSources] = useState<KnowledgeSource[]>(() => backendCourseId === null ? initialKnowledgeSources : []);
  const idCounterRef = useRef(sources.length);
  const hydratedSourcesRef = useRef(false);
  const [mode, setMode] = useState<SourceAddMode>(initialMode);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeSource | null>(null);
  const [urlPreview, setUrlPreview] = useState<{ url: string; title: string; domain: string } | null>(null);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [textErrors, setTextErrors] = useState<{ title?: string; content?: string }>({});
  const [urlError, setUrlError] = useState("");
  const [loadingSources, setLoadingSources] = useState(backendCourseId !== null);
  const [deletingSource, setDeletingSource] = useState(false);
  const readyCount = sources.filter((source) => source.status === "Ready").length;

  const loadBackendDocuments = useCallback(async () => {
    if (backendCourseId === null) return;
    const session = getAuthSession();
    if (!session) {
      router.push("/sign-in");
      return;
    }
    if (session.mode !== "api") {
      setFeedback({ tone: "error", text: "Backend document routes require an API session. Use the seeded demo course in Frontend Demo Mode." });
      setLoadingSources(false);
      return;
    }
    setLoadingSources(true);
    setFeedback(null);
    try {
      const documents = await getDocuments(backendCourseId, session.accessToken);
      setSources(documents.map(sourceFromApi));
    } catch (caught) {
      setFeedback({ tone: "error", text: caught instanceof ApiError ? caught.message : "We couldn’t load this course’s documents." });
    } finally {
      setLoadingSources(false);
    }
  }, [backendCourseId, router]);

  useEffect(() => {
    if (backendCourseId === null) return;
    const timer = window.setTimeout(() => void loadBackendDocuments(), 0);
    return () => window.clearTimeout(timer);
  }, [backendCourseId, loadBackendDocuments]);

  useEffect(() => {
    if (backendCourseId !== null) return;
    if (hydratedSourcesRef.current) {
      writeMockSources(courseId, sources);
      return;
    }
    hydratedSourcesRef.current = true;
    const storedSources = readMockSources(courseId);
    if (JSON.stringify(storedSources) !== JSON.stringify(initialKnowledgeSources)) {
      idCounterRef.current = Math.max(
        storedSources.length,
        ...storedSources.map((source) => Number(source.id.match(/(\d+)$/)?.[1] ?? 0)),
      );
      window.setTimeout(() => setSources(storedSources), 0);
    }
  }, [backendCourseId, courseId, sources]);

  useEffect(() => () => timersRef.current.forEach((timer) => window.clearTimeout(timer)), []);

  function schedule(callback: () => void, duration: number) {
    const timer = window.setTimeout(callback, duration);
    timersRef.current.push(timer);
  }

  function nextSourceId(prefix: string) {
    idCounterRef.current += 1;
    return `${prefix}-${idCounterRef.current}`;
  }

  function updateSource(id: string, updates: Partial<KnowledgeSource>) {
    setSources((current) => current.map((source) => source.id === id ? { ...source, ...updates } : source));
  }

  function simulateFile(file: globalThis.File) {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!allowedExtensions.includes(extension)) {
      setFeedback({ tone: "error", text: `${file.name} isn’t a supported file. Choose a PDF, document, or slide deck.` });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFeedback({ tone: "error", text: `${file.name} is larger than 25 MB. Your existing sources are safe; choose a smaller file.` });
      return;
    }

    const id = nextSourceId("file");
    if (backendCourseId !== null) {
      const session = getAuthSession();
      if (!session) {
        router.push("/sign-in");
        return;
      }
      if (session.mode !== "api") {
        setFeedback({ tone: "error", text: "This backend course requires an API session." });
        return;
      }
      const uploadingSource: KnowledgeSource = {
        id,
        name: file.name,
        type: sourceTypeFor(file.name),
        meta: humanFileSize(file.size),
        status: "Uploading",
        updatedAt: "Uploading now",
        progress: 15,
      };
      setFeedback(null);
      setSources((current) => [uploadingSource, ...current]);
      void uploadDocument(backendCourseId, file, session.accessToken)
        .then((document) => {
          setSources((current) => current.map((source) => source.id === id ? sourceFromApi(document) : source));
          setFeedback({ tone: "success", text: `${document.filename} was uploaded. Refresh the list to retrieve its latest processing status.` });
        })
        .catch((caught) => {
          updateSource(id, { status: "Failed", progress: undefined, updatedAt: "Upload failed" });
          setFeedback({ tone: "error", text: caught instanceof ApiError ? caught.message : `We couldn’t upload ${file.name}.` });
        });
      return;
    }

    const shouldFail = file.name.toLowerCase().includes("fail");
    const source: KnowledgeSource = {
      id,
      name: file.name,
      type: sourceTypeFor(file.name),
      meta: humanFileSize(file.size),
      status: "Uploading",
      updatedAt: "Just now",
      progress: 8,
    };
    setFeedback(null);
    setSources((current) => [source, ...current]);

    let progress = 8;
    const uploadTimer = window.setInterval(() => {
      progress += 18;
      if (progress >= 100) {
        window.clearInterval(uploadTimer);
        updateSource(id, { status: "Processing", progress: undefined });
        schedule(() => updateSource(id, {
          status: shouldFail ? "Failed" : "Ready",
          updatedAt: "Just now",
        }), 1400);
      } else {
        updateSource(id, { progress });
      }
    }, 260);
    timersRef.current.push(uploadTimer);
  }

  function handleFiles(fileList: FileList | null) {
    Array.from(fileList ?? []).forEach(simulateFile);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  }

  function addText(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get("title") ?? "").trim();
    const text = String(data.get("content") ?? "").trim();
    const nextErrors: { title?: string; content?: string } = {};
    if (title.length < 3) nextErrors.title = "Enter a source title with at least 3 characters.";
    if (text.length < 20) nextErrors.content = "Add at least 20 characters of source material.";
    setTextErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSources((current) => [{
      id: nextSourceId("text"),
      name: title,
      type: "Text",
      meta: `${text.split(/\s+/).filter(Boolean).length} words`,
      status: "Ready",
      updatedAt: "Just now",
    }, ...current]);
    setFeedback({ tone: "success", text: `${title} was added and is ready for analysis.` });
    event.currentTarget.reset();
  }

  async function fetchUrl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const url = String(data.get("url") ?? "").trim();
    setFetchingUrl(true);
    setUrlError("");
    setUrlPreview(null);
    try {
      setUrlPreview(await fetchDemoUrl(url));
    } catch (error) {
      setUrlError(error instanceof Error ? error.message : "We couldn’t fetch this page. Try again or paste the content instead.");
    } finally {
      setFetchingUrl(false);
    }
  }

  function addUrl() {
    if (!urlPreview) return;
    const id = nextSourceId("url");
    setSources((current) => [{
      id,
      name: urlPreview.title,
      type: "URL",
      meta: urlPreview.domain,
      status: "Processing",
      updatedAt: "Just now",
    }, ...current]);
    schedule(() => updateSource(id, { status: "Ready", updatedAt: "Just now" }), 1400);
    setFeedback({ tone: "success", text: `${urlPreview.domain} was added and is being processed.` });
    setUrlPreview(null);
  }

  function retrySource(id: string) {
    if (backendCourseId !== null && id.startsWith("document-")) {
      setFeedback({ tone: "error", text: "The current API contract has no document retry endpoint. Delete the failed document and upload it again." });
      return;
    }
    updateSource(id, { status: "Processing", updatedAt: "Retrying now" });
    schedule(() => updateSource(id, { status: "Ready", updatedAt: "Just now" }), 1600);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletingSource(true);
    try {
      if (backendCourseId !== null && deleteTarget.id.startsWith("document-")) {
        const session = getAuthSession();
        if (!session) {
          router.push("/sign-in");
          return;
        }
        if (session.mode !== "api") {
          setFeedback({ tone: "error", text: "This backend document requires an API session." });
          return;
        }
        const documentId = Number(deleteTarget.id.replace("document-", ""));
        await deleteDocument(documentId, session.accessToken);
      }
      setSources((current) => current.filter((source) => source.id !== deleteTarget.id));
      setFeedback({ tone: "success", text: `${deleteTarget.name} was removed. Other course data is unchanged.` });
      setDeleteTarget(null);
    } catch (caught) {
      setFeedback({ tone: "error", text: caught instanceof ApiError ? caught.message : `We couldn’t delete ${deleteTarget.name}.` });
    } finally {
      setDeletingSource(false);
    }
  }

  function scrollToAddSource() {
    document.getElementById("add-source")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <ContentContainer className="max-w-[82rem]">
      <PageHeader
        eyebrow={backendCourseId === null ? "Digital Marketing Foundations" : `Course #${backendCourseId}`}
        title="Add knowledge sources"
        description="Give SkillSync AI the materials it should use to build your course. You can combine multiple source types."
        breadcrumb={[
          { label: "My Courses", href: "/creator/courses" },
          { label: backendCourseId === null ? "Digital Marketing Foundations" : `Course #${backendCourseId}` },
          { label: "Knowledge Sources" },
        ]}
        actions={<div className="flex gap-2">{backendCourseId !== null && <Button variant="ghost" onClick={loadBackendDocuments} isLoading={loadingSources} loadingLabel="Refreshing…"><RefreshCw className="size-4" aria-hidden="true" />Refresh status</Button>}<Button variant="secondary" onClick={scrollToAddSource}><Plus className="size-4" aria-hidden="true" />Add another source</Button></div>}
      />

      {feedback && (
        <div role={feedback.tone === "error" ? "alert" : "status"} className={cn("type-body-small mt-6 flex items-start gap-2 rounded-md p-3", feedback.tone === "error" ? "bg-red-50 text-status-error" : "bg-status-success-subtle text-status-success")}>
          {feedback.tone === "error" ? <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
          {feedback.text}
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <Card id="add-source" className="overflow-hidden shadow-sm">
            <div className="border-b border-border-default p-5 sm:p-6">
              <h2 className="type-title-large">Add material</h2>
              <p className="type-body-small mt-1 text-text-secondary">Choose one source type at a time. Your existing sources stay in the list below.</p>
            </div>
            <div className="grid grid-cols-3 border-b border-border-default bg-neutral-25 p-2" role="tablist" aria-label="Source type">
              {([
                ["file", "Upload files", UploadCloud],
                ["text", "Paste text", FileText],
                ["url", "Add URL", Link2],
              ] as const).map(([id, label, Icon]) => (
                <button key={id} id={`source-tab-${id}`} type="button" role="tab" aria-selected={mode === id} aria-controls="source-tab-panel" onClick={() => { setMode(id); setFeedback(null); }} className={cn("flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition", mode === id ? "bg-surface-default text-blue-800 shadow-sm" : "text-text-secondary hover:bg-neutral-100 hover:text-text-primary")}>
                  <Icon className="size-4" aria-hidden="true" /><span className="hidden sm:inline">{label}</span><span className="sm:hidden">{id === "file" ? "File" : id === "text" ? "Text" : "URL"}</span>
                </button>
              ))}
            </div>

            <div id="source-tab-panel" role="tabpanel" aria-labelledby={`source-tab-${mode}`} className="p-5 sm:p-6">
              {backendCourseId !== null && mode !== "file" && <p className="type-body-small mb-5 rounded-md bg-yellow-50 p-3 text-neutral-700">The current API contract has no {mode === "text" ? "manual-text" : "URL-source"} endpoint. This control remains a frontend-only prototype and is not sent to the backend.</p>}
              {mode === "file" && (
                <div onDragOver={(event) => event.preventDefault()} onDrop={handleDrop} className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50">
                  <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-700"><UploadCloud className="size-6" aria-hidden="true" /></span>
                  <h3 className="mt-4 font-semibold">Drag and drop files here</h3>
                  <p className="type-body-small mt-1 text-text-secondary">PDF, DOC, DOCX, PPT, or PPTX · up to 25 MB each</p>
                  <input ref={fileInputRef} className="sr-only" type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={(event) => handleFiles(event.target.files)} />
                  <Button variant="secondary" className="mt-5" onClick={() => fileInputRef.current?.click()}>Choose files</Button>
                </div>
              )}
              {mode === "text" && (
                <form onSubmit={addText} className="grid gap-5" noValidate>
                  <Field><FieldLabel htmlFor="source-title">Source title</FieldLabel><Input id="source-title" name="title" placeholder="Campaign Planning Notes" validation={textErrors.title ? "error" : "default"} aria-describedby={textErrors.title ? "source-title-error" : undefined} />{textErrors.title && <FieldError id="source-title-error">{textErrors.title}</FieldError>}</Field>
                  <Field><FieldLabel htmlFor="source-text">Source text</FieldLabel><Textarea id="source-text" name="content" rows={7} placeholder="Paste notes, guidelines, or other trusted source material here…" validation={textErrors.content ? "error" : "default"} aria-describedby={textErrors.content ? "source-text-error" : "source-text-guidance"} />{textErrors.content ? <FieldError id="source-text-error">{textErrors.content}</FieldError> : <FieldDescription id="source-text-guidance">Plain text works best. Formatting will be simplified.</FieldDescription>}</Field>
                  <div><Button type="submit">Add source</Button></div>
                </form>
              )}
              {mode === "url" && (
                <div>
                  <form onSubmit={fetchUrl} className="flex flex-col gap-3 sm:flex-row" noValidate>
                    <Field className="flex-1"><FieldLabel htmlFor="source-url">Web page URL</FieldLabel><Input id="source-url" name="url" type="url" placeholder="https://example.com/marketing-guide" validation={urlError ? "error" : "default"} aria-describedby={urlError ? "source-url-error" : "source-url-guidance"} />{urlError ? <FieldError id="source-url-error">{urlError}</FieldError> : <FieldDescription id="source-url-guidance">Use a complete http:// or https:// URL.</FieldDescription>}</Field>
                    <Button type="submit" className="sm:mt-7" isLoading={fetchingUrl} loadingLabel="Fetching…">Fetch content</Button>
                  </form>
                  <p className="type-caption mt-3 text-text-tertiary">Demo behavior: SkillSync creates a safe preview without scraping the page. URLs on a domain containing “fail” return a recoverable error.</p>
                  {urlPreview && <div className="mt-5 flex flex-col gap-4 rounded-lg border border-border-default bg-neutral-25 p-4 sm:flex-row sm:items-center"><span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700"><Globe2 className="size-5" aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="font-semibold">{urlPreview.title}</p><p className="type-body-small truncate text-text-secondary">{urlPreview.domain}</p></div><Button onClick={addUrl}>Add source</Button></div>}
                </div>
              )}
            </div>
          </Card>

          <section className="mt-8" aria-labelledby="source-list-heading">
            <div className="mb-4"><h2 id="source-list-heading" className="type-title-large">Course sources</h2><p className="type-body-small mt-1 text-text-secondary">{sources.length} sources · {readyCount} ready for analysis</p></div>
            {loadingSources ? <Card className="p-6 text-text-secondary">Loading documents from the backend…</Card> : sources.length === 0 ? <EmptySources onAdd={scrollToAddSource} /> : <div className="grid gap-3">{sources.map((source) => <SourceRow key={source.id} source={source} onDelete={() => setDeleteTarget(source)} onRetry={() => retrySource(source.id)} />)}</div>}
          </section>
        </div>

        <aside className="xl:sticky xl:top-26 xl:self-start">
          <Card className="overflow-hidden border-blue-200 shadow-sm">
            <div className="bg-blue-800 p-5 text-white"><Sparkles className="size-6 text-yellow-300" aria-hidden="true" /><h2 className="type-title-large mt-4">Ready for AI analysis?</h2><p className="type-body-small mt-2 text-blue-100">SkillSync will extract topics, concepts, learning relationships, and source references.</p></div>
            <div className="p-5"><div className="flex items-center justify-between gap-4"><span className="type-body-small text-text-secondary">Sources ready</span><strong>{readyCount}</strong></div>{backendCourseId === null ? <><Button size="lg" className="mt-5 w-full" disabled={readyCount === 0} aria-describedby={readyCount === 0 ? "analysis-disabled-reason" : undefined} onClick={() => router.push(`/creator/courses/${courseId}/analysis`)}>Analyze knowledge with AI<ArrowRight className="size-4" aria-hidden="true" /></Button>{readyCount === 0 && <p id="analysis-disabled-reason" className="type-caption mt-3 text-text-secondary">Analysis is unavailable until at least one source has the Ready status.</p>}</> : <><Button size="lg" className="mt-5 w-full" disabled>AI analysis API not documented</Button><p className="type-caption mt-3 text-text-secondary">The API contract documents course generation, but not this separate knowledge-analysis step. No backend request will be guessed.</p></>}<p className="type-caption mt-4 text-text-tertiary">You can refresh while backend documents finish processing.</p></div>
          </Card>
        </aside>
      </div>

      {deleteTarget && <DeleteDialog source={deleteTarget} pending={deletingSource} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />}
    </ContentContainer>
  );
}

function SourceRow({ source, onDelete, onRetry }: { source: KnowledgeSource; onDelete: () => void; onRetry: () => void }) {
  const config = statusConfig[source.status];
  const StatusIcon = config.icon;
  return <Card className="p-4 sm:p-5"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-text-secondary"><File className="size-5" aria-hidden="true" /></span><div className="min-w-0 flex-1"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><h3 className="truncate font-semibold">{source.name}</h3><p className="type-caption mt-0.5 text-text-tertiary">{source.type} · {source.meta} · {source.updatedAt}</p></div><div className="flex shrink-0 items-center gap-2"><Badge variant={config.variant}><StatusIcon className={cn("size-3.5", source.status === "Processing" && "animate-spin")} aria-hidden="true" />{source.status}</Badge>{source.status === "Failed" && <Button variant="ghost" size="sm" onClick={onRetry}><RefreshCw className="size-4" aria-hidden="true" />Retry</Button>}<Button variant="ghost" size="icon" onClick={onDelete} aria-label={`Delete ${source.name}`}><Trash2 className="size-4" aria-hidden="true" /></Button></div></div>{source.status === "Uploading" && <Progress value={source.progress ?? 0} showValue size="sm" className="mt-3" />}{source.status === "Failed" && <p className="type-caption mt-2 flex items-center gap-1.5 text-status-error"><AlertTriangle className="size-3.5" aria-hidden="true" />We couldn’t read this file. Your other sources are safe. Retry it or upload a new copy.</p>}</div></div></Card>;
}

function EmptySources({ onAdd }: { onAdd: () => void }) {
  return <Card className="flex flex-col items-center px-5 py-12 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-700"><UploadCloud className="size-6" aria-hidden="true" /></span><h3 className="type-title-medium mt-4">No sources yet</h3><p className="type-body-small mt-2 max-w-md text-text-secondary">Upload a file, paste your own notes, or add a URL. You can combine all three.</p><Button className="mt-5" onClick={onAdd}><Plus className="size-4" aria-hidden="true" />Add your first source</Button></Card>;
}

function DeleteDialog({ source, pending, onCancel, onConfirm }: { source: KnowledgeSource; pending: boolean; onCancel: () => void; onConfirm: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    cancelRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) { if (event.key === "Escape") onCancel(); }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/40 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (!pending && event.target === event.currentTarget) onCancel(); }}><div role="dialog" aria-modal="true" aria-labelledby="delete-source-title" aria-describedby="delete-source-description" className="w-full max-w-md rounded-xl bg-surface-default p-6 shadow-lg"><div className="flex items-start justify-between gap-4"><span className="flex size-11 items-center justify-center rounded-full bg-red-50 text-status-error"><Trash2 className="size-5" aria-hidden="true" /></span><Button variant="ghost" size="icon" onClick={onCancel} disabled={pending} aria-label="Close delete dialog"><X className="size-5" aria-hidden="true" /></Button></div><h2 id="delete-source-title" className="type-title-large mt-5">Delete this source?</h2><p id="delete-source-description" className="mt-2 text-text-secondary"><strong className="text-text-primary">{source.name}</strong> will be removed from this course and won’t be included in AI analysis.</p><div className="mt-6 flex justify-end gap-3"><Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={pending}>Cancel</Button><Button variant="danger" onClick={onConfirm} isLoading={pending} loadingLabel="Deleting…">Delete source</Button></div></div></div>;
}
