import { ServiceUnavailableException, UnprocessableEntityException } from '@nestjs/common';
import { AntivirusService } from '../integrations/antivirus/antivirus.service';
import { StorageService } from '../integrations/storage/storage.service';
import { DocumentsService } from './documents.service';
import { DOCUMENT_ALLOWED_TYPES, ValidatedDocumentFile } from './upload/upload.constants';

describe('DocumentsService', () => {
  const calls: string[] = [];
  const antivirus = { scan: jest.fn() };
  const storage = { putObject: jest.fn() };
  const service = new DocumentsService(
    antivirus as unknown as AntivirusService,
    storage as unknown as StorageService,
  );

  const file: ValidatedDocumentFile = {
    buffer: Buffer.from('%PDF-1.4 sample'),
    sizeBytes: 15,
    ext: 'pdf',
    mimeType: DOCUMENT_ALLOWED_TYPES.pdf,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    calls.length = 0;
    antivirus.scan.mockImplementation(async () => {
      calls.push('scan');
      return { clean: true };
    });
    storage.putObject.mockImplementation(async ({ key }: { key: string }) => {
      calls.push('store');
      return { key };
    });
  });

  describe('upload', () => {
    it('scans the file before storing it', async () => {
      await service.upload(file);

      expect(antivirus.scan).toHaveBeenCalledWith(file.buffer);
      expect(calls).toEqual(['scan', 'store']);
    });

    it('stores under a server-generated key with the detected content type', async () => {
      await service.upload(file);

      expect(storage.putObject).toHaveBeenCalledWith({
        key: expect.stringMatching(/^documents\/[0-9a-f-]{36}\.pdf$/),
        body: file.buffer,
        contentType: 'application/pdf',
      });
    });

    it('generates a new key for every upload', async () => {
      await service.upload(file);
      await service.upload(file);

      const [first, second] = storage.putObject.mock.calls.map(([input]) => input.key);
      expect(first).not.toEqual(second);
    });

    it('returns the stored file key, type and size', async () => {
      const result = await service.upload(file);

      expect(result).toEqual({
        fileKey: expect.stringMatching(/^documents\/[0-9a-f-]{36}\.pdf$/),
        fileType: 'pdf',
        sizeBytes: 15,
      });
    });

    it('rejects an infected file with 422 and never stores it', async () => {
      antivirus.scan.mockResolvedValue({ clean: false, signature: 'Eicar-Signature' });

      await expect(service.upload(file)).rejects.toBeInstanceOf(UnprocessableEntityException);
      expect(storage.putObject).not.toHaveBeenCalled();
    });

    it('propagates 503 when the scanner is unavailable and never stores the file', async () => {
      antivirus.scan.mockRejectedValue(new ServiceUnavailableException());

      await expect(service.upload(file)).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(storage.putObject).not.toHaveBeenCalled();
    });
  });
});
