import { INestApplication, ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { DocumentsModule } from '../src/documents/documents.module';
import { DOCUMENT_MAX_UPLOAD_BYTES } from '../src/documents/upload/upload.constants';
import { AntivirusService } from '../src/integrations/antivirus/antivirus.service';
import { StorageService } from '../src/storage/storage.service';
import {
  DOCX_MIME,
  FAKE_EXE,
  PDF_MIME,
  PLAIN_ZIP,
  SAMPLE_DOCM,
  SAMPLE_DOCX,
  SAMPLE_PDF,
} from './fixtures/document-fixtures';

describe('POST /documents/upload (e2e)', () => {
  let app: INestApplication;
  const antivirus = { scan: jest.fn() };
  const storage = { uploadDocument: jest.fn() };
  const PUBLIC_ID = 'cloudinary-public-id';
  const STORAGE_NAME = /^[0-9a-f-]{36}\.(pdf|docx)$/;

  const post = () => request(app.getHttpServer()).post('/documents/upload');

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [DocumentsModule] })
      .overrideProvider(AntivirusService)
      .useValue(antivirus)
      .overrideProvider(StorageService)
      .useValue(storage)
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    antivirus.scan.mockResolvedValue({ clean: true });
    storage.uploadDocument.mockResolvedValue({ public_id: PUBLIC_ID });
  });

  describe('accepts', () => {
    it('a valid PDF -> 201', async () => {
      const res = await post().attach('file', SAMPLE_PDF, { filename: 'edp.pdf', contentType: PDF_MIME }).expect(201);

      expect(res.body).toEqual({
        fileKey: PUBLIC_ID,
        fileType: 'pdf',
        sizeBytes: SAMPLE_PDF.length,
      });
      expect(antivirus.scan).toHaveBeenCalledTimes(1);
      expect(storage.uploadDocument).toHaveBeenCalledWith(SAMPLE_PDF, expect.stringMatching(/\.pdf$/));
    });

    it('a valid DOCX -> 201', async () => {
      const res = await post().attach('file', SAMPLE_DOCX, { filename: 'edp.docx', contentType: DOCX_MIME }).expect(201);

      expect(res.body).toMatchObject({ fileType: 'docx', sizeBytes: SAMPLE_DOCX.length });
      expect(storage.uploadDocument).toHaveBeenCalledWith(SAMPLE_DOCX, expect.stringMatching(/\.docx$/));
    });

    it('never uses the client filename as the stored name', async () => {
      await post()
        .attach('file', SAMPLE_PDF, { filename: '..%2F..%2Fetc%2Fpasswd.pdf', contentType: PDF_MIME })
        .expect(201);

      expect(storage.uploadDocument.mock.calls[0][1]).toMatch(STORAGE_NAME);
    });
  });

  describe('rejects with 415 and never scans or stores', () => {
    it.each([
      ['an executable renamed to .pdf', FAKE_EXE, 'invoice.pdf', PDF_MIME],
      ['a macro-enabled .docm renamed to .docx', SAMPLE_DOCM, 'notes.docx', DOCX_MIME],
      ['a plain ZIP renamed to .docx', PLAIN_ZIP, 'notes.docx', DOCX_MIME],
      ['a .docm file', SAMPLE_DOCM, 'notes.docm', 'application/vnd.ms-word.document.macroEnabled.12'],
      ['a text file', Buffer.from('hello'), 'notes.txt', 'text/plain'],
      ['a PDF declared as an image', SAMPLE_PDF, 'notes.pdf', 'image/png'],
    ])('%s', async (_case, buffer, filename, contentType) => {
      await post().attach('file', buffer, { filename, contentType }).expect(415);

      expect(antivirus.scan).not.toHaveBeenCalled();
      expect(storage.uploadDocument).not.toHaveBeenCalled();
    });
  });

  it('rejects a file over the size limit -> 413', async () => {
    const big = Buffer.concat([SAMPLE_PDF, Buffer.alloc(DOCUMENT_MAX_UPLOAD_BYTES)]);

    await post().attach('file', big, { filename: 'big.pdf', contentType: PDF_MIME }).expect(413);
    expect(storage.uploadDocument).not.toHaveBeenCalled();
  });

  describe('rejects with 400 and never stores', () => {
    it('a missing file', async () => {
      await post().expect(400);
    });

    it('an empty file', async () => {
      await post().attach('file', Buffer.alloc(0), { filename: 'empty.pdf', contentType: PDF_MIME }).expect(400);
    });

    it('two files', async () => {
      await post()
        .attach('file', SAMPLE_PDF, { filename: 'a.pdf', contentType: PDF_MIME })
        .attach('file', SAMPLE_PDF, { filename: 'b.pdf', contentType: PDF_MIME })
        .expect(400);
    });

    it('a file sent under another field name', async () => {
      await post().attach('document', SAMPLE_PDF, { filename: 'a.pdf', contentType: PDF_MIME }).expect(400);
    });

    it('extra form fields next to the file', async () => {
      await post()
        .field('uploaderId', 'someone-else')
        .attach('file', SAMPLE_PDF, { filename: 'a.pdf', contentType: PDF_MIME })
        .expect(400);
    });

    afterEach(() => {
      expect(storage.uploadDocument).not.toHaveBeenCalled();
    });
  });

  it('rejects an infected file -> 422 and never stores it', async () => {
    antivirus.scan.mockResolvedValue({ clean: false, signature: 'Eicar-Signature' });

    await post().attach('file', SAMPLE_PDF, { filename: 'a.pdf', contentType: PDF_MIME }).expect(422);
    expect(storage.uploadDocument).not.toHaveBeenCalled();
  });

  it('fails closed when the scanner is unavailable -> 503 and never stores it', async () => {
    antivirus.scan.mockRejectedValue(new ServiceUnavailableException());

    await post().attach('file', SAMPLE_PDF, { filename: 'a.pdf', contentType: PDF_MIME }).expect(503);
    expect(storage.uploadDocument).not.toHaveBeenCalled();
  });
});
