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
  Globe2,
  Link2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { ContentContainer, PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  ConfirmationDialog,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  Progress,
} from "@/components/ui";
import { initialKnowledgeSources } from "@/data/mock/product";
import { getAuthSession } from "@/features/auth/lib/auth-session";
import {
  deleteDocument,
  getKnowledgeSources,
  processKnowledgeSource,
  uploadDocument,
  type ApiCourseDocument,
  type ApiDocumentStatus,
} from "@/features/knowledge-sources/api/document-api";
import { ApiError } from "@/lib/api/api-client";
import { cn } from "@/lib/cn";
import { fetchDemoUrl } from "@/lib/mock/demo-services";
import { readMockSources, writeMockSources } from "@/lib/mock/source-store";
import type { KnowledgeSource, SourceStatus, SourceType } from "@/types/product";
import {
  isUploadedFileSource,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  MAX_UPLOAD_FILES,
  normalizeSourceUrl,
  SUPPORTED_FILE_EXTENSIONS,
} from "@/features/knowledge-sources/lib/source-config";

export type SourceAddMode = "file" | "url";
type Feedback = { tone: "error" | "success"; text: string };

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
  const chunkCount = document.chunk_count ?? 0;
  const sourceType = document.source_type === "URL" ? "URL" : sourceTypeFor(document.filename);
  return {
    id: `document-${document.id}`,
    name: document.filename,
    type: sourceType,
    meta: chunkCount > 0
      ? `${chunkCount} ${chunkCount === 1 ? "chunk" : "chunks"}`
      : typeof document.size === "number"
        ? humanFileSize(document.size)
        : document.file_type?.toUpperCase() ?? "Backend document",
    status: apiStatusToSourceStatus[document.status],
    updatedAt: "From backend",
    chunkCount,
    processingError: document.processing_error,
  };
}

export function SourceManager({ courseId, initialMode = "file" }: { courseId: string; initialMode?: SourceAddMode }) {
  const router = useRouter();
  const backendCourseId = /^\d+$/.test(courseId) ? Number(courseId) : null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlFormRef = useRef<HTMLFormElement>(null);
  const timersRef = useRef<number[]>([]);
  const [sources, setSources] = useState<KnowledgeSource[]>(() => backendCourseId === null ? initialKnowledgeSources : []);
  const idCounterRef = useRef(sources.length);
  const hydratedSourcesRef = useRef(false);
  const [mode, setMode] = useState<SourceAddMode>(initialMode);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeSource | null>(null);
  const [urlPreview, setUrlPreview] = useState<{ url: string; title: string; domain: string } | null>(null);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [urlError, setUrlError] = useState("");
  const [loadingSources, setLoadingSources] = useState(backendCourseId !== null);
  const [deletingSource, setDeletingSource] = useState(false);
  const [processingSources, setProcessingSources] = useState(false);
  const readyCount = sources.filter((source) => source.status === "Ready").length;
  const uploadedFileCount = sources.filter((source) => isUploadedFileSource(source.type)).length;
  const uploadCapacityReached = uploadedFileCount >= MAX_UPLOAD_FILES;

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
      const knowledgeSources = await getKnowledgeSources(backendCourseId, session.accessToken);
      setSources(knowledgeSources.map(sourceFromApi));
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

  function backendSourceId(id: string) {
    const value = Number(id.replace("document-", ""));
    return Number.isInteger(value) && value > 0 ? value : null;
  }

  async function processBackendSources(sourceIds?: string[]) {
    if (backendCourseId === null) return;
    const session = getAuthSession();
    if (!session) {
      router.push("/sign-in");
      return;
    }
    if (session.mode !== "api") {
      setFeedback({ tone: "error", text: "Knowledge Processing requires an API session." });
      return;
    }

    const candidates = sources.filter((source) => {
      const selected = sourceIds?.includes(source.id) ?? true;
      return selected && backendSourceId(source.id) !== null && (source.status === "Uploaded" || source.status === "Failed");
    });
    if (candidates.length === 0) {
      setFeedback({
        tone: readyCount > 0 ? "success" : "error",
        text: readyCount > 0
          ? "Every uploaded source has already been processed and is ready for AI generation."
          : "Upload a TXT, Markdown, or selectable-text PDF before processing.",
      });
      return;
    }

    setProcessingSources(true);
    setFeedback(null);
    setSources((current) => current.map((source) => candidates.some((candidate) => candidate.id === source.id)
      ? { ...source, status: "Processing", processingError: null, updatedAt: "Extracting text…" }
      : source));

    const results = await Promise.allSettled(candidates.map(async (source) => {
      const sourceId = backendSourceId(source.id);
      if (sourceId === null) throw new Error("Invalid knowledge source id");
      return { id: source.id, result: await processKnowledgeSource(sourceId, session.accessToken) };
    }));

    let completed = 0;
    let failed = 0;
    results.forEach((result, index) => {
      const source = candidates[index];
      if (result.status === "fulfilled") {
        completed += 1;
        updateSource(source.id, sourceFromApi(result.value.result.source));
        return;
      }
      failed += 1;
      updateSource(source.id, {
        status: "Failed",
        updatedAt: "Processing failed",
        processingError: result.reason instanceof ApiError ? result.reason.message : "We couldn’t extract text from this source.",
      });
    });
    setProcessingSources(false);
    if (failed > 0) {
      setFeedback({
        tone: "error",
        text: completed > 0
          ? `${completed} source${completed === 1 ? "" : "s"} processed, but ${failed} failed. Try a TXT, Markdown, or selectable-text PDF.`
          : "We couldn’t process these sources. Use a TXT, Markdown, or selectable-text PDF and try again.",
      });
    } else {
      const chunksCreated = results.reduce((total, result) => total + (result.status === "fulfilled" ? result.value.result.chunks_created : 0), 0);
      setFeedback({ tone: "success", text: `${completed} source${completed === 1 ? "" : "s"} processed into ${chunksCreated} knowledge chunk${chunksCreated === 1 ? "" : "s"}.` });
    }
  }

  function simulateFile(file: globalThis.File) {
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
          setFeedback({ tone: "success", text: `${document.filename} was uploaded. Process it when you’re ready to extract knowledge chunks.` });
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
    const selectedFiles = Array.from(fileList ?? []);
    if (selectedFiles.length === 0) return;

    const nextFileCount = uploadedFileCount + selectedFiles.length;
    if (nextFileCount > MAX_UPLOAD_FILES) {
      setFeedback({
        tone: "error",
        text: `You can upload up to ${MAX_UPLOAD_FILES} files per course. You already have ${uploadedFileCount}. Remove a file before adding more.`,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const unsupported = selectedFiles
      .map((file) => file.name.split(".").pop()?.toLowerCase() ?? "")
      .map((extension, index) => ({ extension, file: selectedFiles[index] }))
      .filter(({ extension }) => !SUPPORTED_FILE_EXTENSIONS.includes(extension as (typeof SUPPORTED_FILE_EXTENSIONS)[number]));
    if (unsupported.length > 0) {
      setFeedback({
        tone: "error",
        text: `${unsupported.map(({ file }) => file.name).join(", ")} ${unsupported.length === 1 ? "is" : "are"} not supported. Choose PDF, document, slide, TXT, or Markdown files.`,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const oversized = selectedFiles.filter((file) => file.size > MAX_FILE_SIZE_BYTES);
    if (oversized.length > 0) {
      setFeedback({
        tone: "error",
        text: `${oversized.map((file) => `${file.name} is larger than ${MAX_FILE_SIZE_MB} MB`).join("; ")}. Remove the oversized file${oversized.length === 1 ? "" : "s"} and try again.`,
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    selectedFiles.forEach(simulateFile);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  }

  async function fetchUrl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const url = String(data.get("url") ?? "").trim();
    setFetchingUrl(true);
    setUrlError("");
    setUrlPreview(null);
    let normalizedUrl: string;
    try {
      normalizedUrl = normalizeSourceUrl(url);
    } catch {
      setUrlError("Enter a valid URL.");
      setFetchingUrl(false);
      return;
    }
    if (sources.some((source) => source.type === "URL" && source.sourceUrl && normalizeSourceUrl(source.sourceUrl) === normalizedUrl)) {
      setUrlError("This URL has already been added.");
      setFetchingUrl(false);
      return;
    }
    try {
      setUrlPreview({ ...await fetchDemoUrl(normalizedUrl), url: normalizedUrl });
    } catch (error) {
      setUrlError(error instanceof Error ? error.message : "We couldn’t fetch this page. Check the URL and try again.");
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
      sourceUrl: urlPreview.url,
      meta: urlPreview.domain,
      status: "Processing",
      updatedAt: "Just now",
    }, ...current]);
    schedule(() => updateSource(id, { status: "Ready", updatedAt: "Just now" }), 1400);
    setFeedback({ tone: "success", text: `${urlPreview.domain} was added and is being processed.` });
    setUrlPreview(null);
    urlFormRef.current?.reset();
    setUrlError("");
  }

  function cancelUrlPreview() {
    setUrlPreview(null);
    setUrlError("");
    urlFormRef.current?.reset();
  }

  function retrySource(id: string) {
    if (backendCourseId !== null && id.startsWith("document-")) {
      void processBackendSources([id]);
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
            <div className="grid grid-cols-2 border-b border-border-default bg-neutral-25 p-2" role="tablist" aria-label="Source type">
              {([
                ["file", "Upload files", UploadCloud],
                ["url", "Add URL", Link2],
              ] as const).map(([id, label, Icon]) => (
                <button key={id} id={`source-tab-${id}`} type="button" role="tab" aria-selected={mode === id} aria-controls="source-tab-panel" onClick={() => { setMode(id); setFeedback(null); }} className={cn("flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition", mode === id ? "bg-surface-default text-blue-800 shadow-sm" : "text-text-secondary hover:bg-neutral-100 hover:text-text-primary")}>
                  <Icon className="size-4" aria-hidden="true" /><span className="hidden sm:inline">{label}</span><span className="sm:hidden">{id === "file" ? "File" : "URL"}</span>
                </button>
              ))}
            </div>

            <div id="source-tab-panel" role="tabpanel" aria-labelledby={`source-tab-${mode}`} className="p-5 sm:p-6">
              {mode === "file" && (
                <div onDragOver={(event) => event.preventDefault()} onDrop={handleDrop} aria-describedby="file-upload-guidance" className={cn("rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50", uploadCapacityReached && "border-neutral-300 bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-50")}>
                  <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-700"><UploadCloud className="size-6" aria-hidden="true" /></span>
                  <h3 className="mt-4 font-semibold">Drag and drop files here</h3>
                  <p id="file-upload-guidance" className="type-body-small mt-1 text-text-secondary">PDF, DOC, DOCX, PPT, PPTX, TXT, or Markdown · up to {MAX_UPLOAD_FILES} files · maximum {MAX_FILE_SIZE_MB} MB per file</p>
                  <p className="type-caption mt-2 text-text-tertiary">{uploadedFileCount} / {MAX_UPLOAD_FILES} files uploaded</p>
                  <input ref={fileInputRef} className="sr-only" type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md" disabled={uploadCapacityReached} onChange={(event) => handleFiles(event.target.files)} />
                  <Button variant="secondary" className="mt-5" disabled={uploadCapacityReached} aria-describedby="file-upload-capacity" onClick={() => fileInputRef.current?.click()}>Choose files</Button>
                  {uploadCapacityReached && <p id="file-upload-capacity" className="type-body-small mt-3 text-text-secondary">Maximum of {MAX_UPLOAD_FILES} files reached. Remove a file before adding another.</p>}
                </div>
              )}
              {mode === "url" && (
                <div>
                  <form ref={urlFormRef} onSubmit={fetchUrl} className="flex flex-col gap-3 sm:flex-row" noValidate>
                    <Field className="flex-1"><FieldLabel htmlFor="source-url">Web page URL</FieldLabel><Input id="source-url" name="url" type="url" placeholder="https://example.com/marketing-guide" validation={urlError ? "error" : "default"} aria-describedby={urlError ? "source-url-error" : "source-url-guidance"} />{urlError ? <FieldError id="source-url-error">{urlError}</FieldError> : <FieldDescription id="source-url-guidance">Use a complete http:// or https:// URL.</FieldDescription>}</Field>
                    <Button type="submit" className="sm:mt-7" isLoading={fetchingUrl} loadingLabel="Checking URL…">Check URL</Button>
                  </form>
                  <p className="type-caption mt-3 text-text-tertiary">SkillSync creates a safe preview before adding the URL. You can add multiple URLs to this course.</p>
                  {urlPreview && <div className="mt-5 flex flex-col gap-4 rounded-lg border border-border-default bg-neutral-25 p-4 sm:flex-row sm:items-center"><span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700"><Globe2 className="size-5" aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="font-semibold">{urlPreview.title}</p><p className="type-body-small break-all text-text-secondary">{urlPreview.url}</p></div><div className="flex shrink-0 gap-2"><Button type="button" variant="ghost" onClick={cancelUrlPreview}>Cancel</Button><Button type="button" onClick={addUrl}>Add URL</Button></div></div>}
                </div>
              )}
            </div>
          </Card>

          <section className="mt-8" aria-labelledby="source-list-heading">
            <div className="mb-4"><h2 id="source-list-heading" className="type-title-large">Course sources</h2><p className="type-body-small mt-1 text-text-secondary">{sources.length} sources · {uploadedFileCount} / {MAX_UPLOAD_FILES} files · {readyCount} ready for analysis</p></div>
            {loadingSources ? <Card className="p-6 text-text-secondary">Loading documents from the backend…</Card> : sources.length === 0 ? <EmptySources onAdd={scrollToAddSource} /> : <div className="grid gap-3">{sources.map((source) => <SourceRow key={source.id} source={source} onDelete={() => setDeleteTarget(source)} onRetry={() => retrySource(source.id)} />)}</div>}
          </section>
        </div>

        <aside className="xl:sticky xl:top-26 xl:self-start">
          <Card className="overflow-hidden border-blue-200 shadow-sm">
            <div className="bg-blue-800 p-5 text-white"><Sparkles className="size-6 text-yellow-300" aria-hidden="true" /><h2 className="type-title-large mt-4">Ready for AI analysis?</h2><p className="type-body-small mt-2 text-blue-100">SkillSync will extract topics, concepts, learning relationships, and source references.</p></div>
            <div className="p-5"><div className="flex items-center justify-between gap-4"><span className="type-body-small text-text-secondary">Sources ready</span><strong>{readyCount}</strong></div>{backendCourseId === null ? <><Button size="lg" className="mt-5 w-full" disabled={readyCount === 0} aria-describedby={readyCount === 0 ? "analysis-disabled-reason" : undefined} onClick={() => router.push(`/creator/courses/${courseId}/analysis`)}>Analyze knowledge with AI<ArrowRight className="size-4" aria-hidden="true" /></Button>{readyCount === 0 && <p id="analysis-disabled-reason" className="type-caption mt-3 text-text-secondary">Analysis is unavailable until at least one source has the Ready status.</p>}</> : <><Button size="lg" className="mt-5 w-full" onClick={() => void processBackendSources()} isLoading={processingSources} loadingLabel="Processing…">Process knowledge sources<Sparkles className="size-4" aria-hidden="true" /></Button>{readyCount > 0 && <ButtonLink href={`/creator/courses/${courseId}/generate`} variant="secondary" className="mt-3 w-full">Generate course with Typhoon<ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>}<p className="type-caption mt-3 text-text-secondary">Extracts TXT, Markdown, and selectable-text PDF files into source-grounded chunks for AI generation.</p></>}<p className="type-caption mt-4 text-text-tertiary">You can refresh while backend documents finish processing.</p></div>
          </Card>
        </aside>
      </div>

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        title="Delete this source?"
        description={deleteTarget ? `${deleteTarget.name} will be removed from this course and won’t be included in AI analysis.` : "This source will be removed from the course."}
        confirmLabel="Delete source"
        confirmVariant="danger"
        pending={deletingSource}
        pendingLabel="Deleting…"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </ContentContainer>
  );
}

function SourceRow({ source, onDelete, onRetry }: { source: KnowledgeSource; onDelete: () => void; onRetry: () => void }) {
  const config = statusConfig[source.status];
  const StatusIcon = config.icon;
  return <Card className="p-4 sm:p-5"><div className="flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-text-secondary"><File className="size-5" aria-hidden="true" /></span><div className="min-w-0 flex-1"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><h3 className="truncate font-semibold">{source.name}</h3><p className="type-caption mt-0.5 break-words text-text-tertiary">{source.type} · {source.sourceUrl ?? source.meta} · {source.updatedAt}</p></div><div className="flex shrink-0 items-center gap-2"><Badge variant={config.variant}><StatusIcon className={cn("size-3.5", source.status === "Processing" && "animate-spin")} aria-hidden="true" />{source.status}</Badge>{source.status === "Failed" && <Button variant="ghost" size="sm" onClick={onRetry}><RefreshCw className="size-4" aria-hidden="true" />Retry</Button>}<Button variant="ghost" size="icon" onClick={onDelete} aria-label={`Delete ${source.name}`}><Trash2 className="size-4" aria-hidden="true" /> </Button></div></div>{source.status === "Uploading" && <Progress value={source.progress ?? 0} showValue size="sm" className="mt-3" />}{source.status === "Failed" && <p className="type-caption mt-2 flex items-center gap-1.5 text-status-error"><AlertTriangle className="size-3.5" aria-hidden="true" />{source.processingError ?? "We couldn’t read this file. Your other sources are safe. Retry it or upload a new copy."}</p>}</div></div></Card>;
}

function EmptySources({ onAdd }: { onAdd: () => void }) {
  return <Card className="flex flex-col items-center px-5 py-12 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-700"><UploadCloud className="size-6" aria-hidden="true" /></span><h3 className="type-title-medium mt-4">No sources yet</h3><p className="type-body-small mt-2 max-w-md text-text-secondary">Upload a file or add a URL to give SkillSync trusted material for analysis.</p><Button className="mt-5" onClick={onAdd}><Plus className="size-4" aria-hidden="true" />Add your first source</Button></Card>;
}
