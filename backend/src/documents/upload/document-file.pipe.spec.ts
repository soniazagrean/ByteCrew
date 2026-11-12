import { BadRequestException, PayloadTooLargeException, UnsupportedMediaTypeException } from '@nestjs/common';
import {
  DOCX_MIME,
  FAKE_EXE,
  PDF_MIME,
  PLAIN_ZIP,
  SAMPLE_DOCM,
  SAMPLE_DOCX,
  SAMPLE_PDF,
} from '../../../test/fixtures/document-fixtures';
import { DocumentFilePipe, getDocumentExtension, isDeclaredTypeAcceptable } from './document-file.pipe';
import { DOCUMENT_MAX_UPLOAD_BYTES } from './upload.constants';

function upload(originalname: string, mimetype: string, buffer: Buffer): Express.Multer.File {
  return { originalname, mimetype, buffer, size: buffer.length, fieldname: 'file' } as Express.Multer.File;
}

describe('DocumentFilePipe', () => {
  const pipe = new DocumentFilePipe();

  describe('accepts', () => {
    it('a real PDF', async () => {
      await expect(pipe.transform(upload('notes.pdf', PDF_MIME, SAMPLE_PDF))).resolves.toEqual({
        buffer: SAMPLE_PDF,
        sizeBytes: SAMPLE_PDF.length,
        ext: 'pdf',
        mimeType: PDF_MIME,
      });
    });

    it('a real DOCX', async () => {
      await expect(pipe.transform(upload('notes.docx', DOCX_MIME, SAMPLE_DOCX))).resolves.toMatchObject({
        ext: 'docx',
        mimeType: DOCX_MIME,
      });
    });

    it('an upper-case extension', async () => {
      await expect(pipe.transform(upload('NOTES.PDF', PDF_MIME, SAMPLE_PDF))).resolves.toMatchObject({ ext: 'pdf' });
    });

    it('a generic declared type, because the bytes decide', async () => {
      await expect(
        pipe.transform(upload('notes.docx', 'application/octet-stream', SAMPLE_DOCX)),
      ).resolves.toMatchObject({ ext: 'docx', mimeType: DOCX_MIME });
    });
  });

  describe('rejects with 400', () => {
    it('a missing file', async () => {
      await expect(pipe.transform(undefined)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('an empty file', async () => {
      await expect(pipe.transform(upload('empty.pdf', PDF_MIME, Buffer.alloc(0)))).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  it('rejects an oversized file with 413', async () => {
    const big = { ...upload('big.pdf', PDF_MIME, SAMPLE_PDF), size: DOCUMENT_MAX_UPLOAD_BYTES + 1 };

    await expect(pipe.transform(big)).rejects.toBeInstanceOf(PayloadTooLargeException);
  });

  describe('rejects with 415', () => {
    it.each([
      ['an executable renamed to .pdf', 'invoice.pdf', PDF_MIME, FAKE_EXE],
      ['a macro-enabled .docm renamed to .docx', 'notes.docx', DOCX_MIME, SAMPLE_DOCM],
      ['a plain ZIP renamed to .docx', 'notes.docx', DOCX_MIME, PLAIN_ZIP],
      ['a DOCX renamed to .pdf', 'notes.pdf', PDF_MIME, SAMPLE_DOCX],
      ['a .docm extension', 'notes.docm', 'application/vnd.ms-word.document.macroEnabled.12', SAMPLE_DOCM],
      ['a double extension', 'notes.pdf.exe', PDF_MIME, SAMPLE_PDF],
      ['no extension', 'notes', PDF_MIME, SAMPLE_PDF],
      ['a declared type that contradicts the extension', 'notes.pdf', 'image/png', SAMPLE_PDF],
    ])('%s', async (_case, name, mimetype, buffer) => {
      await expect(pipe.transform(upload(name, mimetype, buffer))).rejects.toBeInstanceOf(
        UnsupportedMediaTypeException,
      );
    });
  });
});

describe('getDocumentExtension', () => {
  it.each([
    ['report.pdf', 'pdf'],
    ['Report.DocX', 'docx'],
    ['archive.tar.pdf', 'pdf'],
    ['report.pdf.exe', null],
    ['.pdf', null],
    ['', null],
    [undefined, null],
  ])('%s -> %s', (name, expected) => {
    expect(getDocumentExtension(name)).toBe(expected);
  });
});

describe('isDeclaredTypeAcceptable', () => {
  it.each([
    ['pdf', 'application/pdf', true],
    ['pdf', 'Application/PDF; charset=binary', true],
    ['pdf', 'application/octet-stream', true],
    ['pdf', '', true],
    ['pdf', DOCX_MIME, false],
    ['docx', 'application/zip', false],
  ] as const)('%s declared as "%s" -> %s', (ext, declared, expected) => {
    expect(isDeclaredTypeAcceptable(ext, declared)).toBe(expected);
  });
});
