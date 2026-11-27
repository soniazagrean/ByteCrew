import { afterEach, describe, expect, it, vi } from 'vitest';
import { documentsApi } from './documents.api';

const payload = {
  file: new File(['%PDF-1.4'], 'a.pdf', { type: 'application/pdf' }),
  title: 'Title',
  specialization: 'Spec',
  year: 1,
  semester: 1,
  course: 'Course',
  tags: [],
};

/** Replaces XMLHttpRequest with one that answers every request the same way. */
function stubXhr(status: number, responseText = '') {
  vi.stubGlobal(
    'XMLHttpRequest',
    class {
      status = status;
      responseText = responseText;
      upload = {};
      onload?: () => void;
      onerror?: () => void;
      open() {}
      send() {
        queueMicrotask(() => (status === 0 ? this.onerror?.() : this.onload?.()));
      }
    },
  );
}

describe('documentsApi.uploadDocument', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('returns the document when the server accepts the file', async () => {
    stubXhr(201, JSON.stringify({ fileKey: 'key', fileType: 'pdf', sizeBytes: 8 }));
    await expect(documentsApi.uploadDocument(payload)).resolves.toMatchObject({ fileKey: 'key' });
  });

  it('rejects with the server reason when the file is refused', async () => {
    stubXhr(422, JSON.stringify({ message: 'The file was rejected by the virus scanner.' }));
    await expect(documentsApi.uploadDocument(payload)).rejects.toThrow(/virus scanner/);
  });

  it('rejects on a server error with a non-JSON body', async () => {
    stubXhr(502, '<html>Bad gateway</html>');
    await expect(documentsApi.uploadDocument(payload)).rejects.toThrow(/502/);
  });

  it('rejects when the server cannot be reached', async () => {
    stubXhr(0);
    await expect(documentsApi.uploadDocument(payload)).rejects.toThrow(/contacta serverul/);
  });
});
