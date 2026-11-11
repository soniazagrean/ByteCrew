import {
  BadRequestException,
  FileTypeValidator,
  Injectable,
  PayloadTooLargeException,
  PipeTransform,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { extname } from 'path';
import {
  DOCUMENT_ALLOWED_TYPES,
  DOCUMENT_FILE_FIELD,
  DOCUMENT_MAX_UPLOAD_BYTES,
  DocumentFileExt,
  ValidatedDocumentFile,
} from './upload.constants';

const GENERIC_DECLARED_TYPES = new Set(['', 'application/octet-stream']);

export function getDocumentExtension(originalName: string | undefined): DocumentFileExt | null {
  const ext = extname(originalName ?? '').slice(1).toLowerCase();
  return Object.prototype.hasOwnProperty.call(DOCUMENT_ALLOWED_TYPES, ext) ? (ext as DocumentFileExt) : null;
}

export function isDeclaredTypeAcceptable(ext: DocumentFileExt, declaredType: string | undefined): boolean {
  const declared = (declaredType ?? '').split(';')[0].trim().toLowerCase();
  return declared === DOCUMENT_ALLOWED_TYPES[ext] || GENERIC_DECLARED_TYPES.has(declared);
}

export function unsupportedDocumentType(): UnsupportedMediaTypeException {
  return new UnsupportedMediaTypeException('Only PDF (.pdf) and Word (.docx) files are accepted.');
}

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const CONTENT_VALIDATORS: Record<DocumentFileExt, FileTypeValidator> = {
  pdf: new FileTypeValidator({ fileType: new RegExp(`^${escapeRegExp(DOCUMENT_ALLOWED_TYPES.pdf)}$`) }),
  docx: new FileTypeValidator({ fileType: new RegExp(`^${escapeRegExp(DOCUMENT_ALLOWED_TYPES.docx)}$`) }),
};

@Injectable()
export class DocumentFilePipe implements PipeTransform<Express.Multer.File | undefined, Promise<ValidatedDocumentFile>> {
  async transform(file: Express.Multer.File | undefined): Promise<ValidatedDocumentFile> {
    if (!file) {
      throw new BadRequestException(`A PDF or DOCX file is required in the "${DOCUMENT_FILE_FIELD}" field.`);
    }
    if (!file.buffer || file.size === 0) {
      throw new BadRequestException('The uploaded file is empty.');
    }
    if (file.size > DOCUMENT_MAX_UPLOAD_BYTES) {
      throw new PayloadTooLargeException('The uploaded file is too large.');
    }

    const ext = getDocumentExtension(file.originalname);
    if (!ext || !isDeclaredTypeAcceptable(ext, file.mimetype)) {
      throw unsupportedDocumentType();
    }
    if (!(await CONTENT_VALIDATORS[ext].isValid(file))) {
      throw new UnsupportedMediaTypeException(`The file content is not a valid .${ext} document.`);
    }

    return { buffer: file.buffer, sizeBytes: file.size, ext, mimeType: DOCUMENT_ALLOWED_TYPES[ext] };
  }
}
