export const DOCUMENT_FILE_FIELD = 'file';

export const DOCUMENT_ALLOWED_TYPES = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
} as const;

export type DocumentFileExt = keyof typeof DOCUMENT_ALLOWED_TYPES;

const DEFAULT_MAX_UPLOAD_MB = 20;

export function resolveMaxUploadBytes(raw: string | undefined = process.env.DOCUMENTS_MAX_UPLOAD_MB): number {
  const megabytes = raw === undefined || raw.trim() === '' ? DEFAULT_MAX_UPLOAD_MB : Number(raw);
  if (!Number.isFinite(megabytes) || megabytes <= 0) {
    throw new Error(`DOCUMENTS_MAX_UPLOAD_MB must be a positive number, got "${raw}"`);
  }
  return Math.floor(megabytes * 1024 * 1024);
}

export const DOCUMENT_MAX_UPLOAD_BYTES = resolveMaxUploadBytes();

export interface ValidatedDocumentFile {
  buffer: Buffer;
  sizeBytes: number;
  ext: DocumentFileExt;
  mimeType: string;
}
