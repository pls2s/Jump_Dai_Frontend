export const MAX_UPLOAD_FILES = 10;
export const MAX_FILE_SIZE_MB = 25;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const SUPPORTED_FILE_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "txt",
  "md",
] as const;

export function isUploadedFileSource(type: string) {
  return type === "PDF" || type === "Document" || type === "Slide";
}

export function normalizeSourceUrl(value: string) {
  const parsed = new URL(value.trim());
  parsed.hash = "";
  if (parsed.pathname.length > 1) {
    parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  }
  return parsed.toString();
}
