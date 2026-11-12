import { Test, TestingModule } from '@nestjs/testing';
import { v2 as cloudinary } from 'cloudinary';
import { StorageService } from './storage.service';

jest.mock('cloudinary', () => ({
    v2: {
        uploader: {
            upload_stream: jest.fn(),
            destroy: jest.fn(),
        },
        utils: {
            private_download_url: jest.fn(),
        },
    },
}));

describe('StorageService', () => {
    let service: StorageService;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StorageService,
                {
                    provide: 'CLOUDINARY',
                    useValue: cloudinary,
                },
            ],
        }).compile();

        service = module.get(StorageService);
    });

    describe('uploadDocument', () => {
        it('uploads the buffer as an authenticated raw resource', async () => {
            const uploadStream = {
                end: jest.fn(),
            };
            const response = {
                public_id: 'student-hub/documents/document-123',
                resource_type: 'raw',
                type: 'authenticated',
                format: 'pdf',
            };

            (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
                (options, callback) => {
                    expect(options).toEqual({
                        resource_type: 'raw',
                        type: 'authenticated',
                        asset_folder: 'student-hub/documents',
                        display_name: 'document.pdf',
                    });
                    callback(null, response);
                    return uploadStream;
                },
            );

            const buffer = Buffer.from('document');

            await expect(
                service.uploadDocument(buffer, 'document.pdf'),
            ).resolves.toBe(response);
            expect(uploadStream.end).toHaveBeenCalledWith(buffer);
        });

        it('rejects when Cloudinary returns an upload error', async () => {
            const error = new Error('upload failed');

            (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
                (_options, callback) => {
                    callback(error);
                    return { end: jest.fn() };
                },
            );

            await expect(
                service.uploadDocument(Buffer.from('document'), 'document.pdf'),
            ).rejects.toBe(error);
        });

        it('rejects when Cloudinary returns no result', async () => {
            (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
                (_options, callback) => {
                    callback(null, undefined);
                    return { end: jest.fn() };
                },
            );

            await expect(
                service.uploadDocument(Buffer.from('document'), 'document.pdf'),
            ).rejects.toThrow('Cloudinary upload failed');
        });
    });

    describe('generateSignedUrl', () => {
        it('generates a signed URL for an authenticated raw resource', () => {
            const signedUrl = 'https://cloudinary.example/signed-document';
            const now = 1_700_000_000;
            jest.spyOn(Date, 'now').mockReturnValue(now * 1000);
            (
                cloudinary.utils.private_download_url as jest.Mock
            ).mockReturnValue(signedUrl);

            expect(
                service.generateSignedUrl('document-123', 'pdf', 300),
            ).toBe(signedUrl);
            expect(
                cloudinary.utils.private_download_url,
            ).toHaveBeenCalledWith('document-123', 'pdf', {
                resource_type: 'raw',
                type: 'authenticated',
                expires_at: now + 300,
            });

            jest.restoreAllMocks();
        });
    });

    describe('deleteDocument', () => {
        it('deletes the document and invalidates the CDN cache', async () => {
            (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
                result: 'ok',
            });

            await expect(service.deleteDocument('document-123')).resolves.toBe(
                undefined,
            );
            expect(cloudinary.uploader.destroy).toHaveBeenCalledWith(
                'document-123',
                {
                    resource_type: 'raw',
                    type: 'authenticated',
                    invalidate: true,
                },
            );
        });

        it('accepts a document that is already missing', async () => {
            (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
                result: 'not found',
            });

            await expect(
                service.deleteDocument('missing-document'),
            ).resolves.toBeUndefined();
        });

        it('rejects unexpected Cloudinary delete results', async () => {
            (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
                result: 'error',
            });

            await expect(
                service.deleteDocument('document-123'),
            ).rejects.toThrow('Cloudinary delete failed');
        });
    });

});

describe('StorageService - Edge Cases', () => {
    let service: StorageService;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StorageService,
                {
                    provide: 'CLOUDINARY',
                    useValue: cloudinary,
                },
            ],
        }).compile();

        service = module.get(StorageService);
    });

    describe('uploadDocument (Edge Cases)', () => {
        it('rejects with the exact error if Cloudinary callback returns an error', async () => {
            const mockError = new Error('Cloudinary rate limit exceeded');

            (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
                (options, callback) => {
                    callback(mockError, null);
                    return { end: jest.fn() };
                },
            );

            await expect(
                service.uploadDocument(Buffer.from('test'), 'test.pdf'),
            ).rejects.toThrow('Cloudinary rate limit exceeded');
        });

        it('rejects with a fallback error if Cloudinary returns no result', async () => {
            (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
                (options, callback) => {
                    callback(null, undefined); // Nicio eroare, dar nici rezultat
                    return { end: jest.fn() };
                },
            );

            await expect(
                service.uploadDocument(Buffer.from('test'), 'test.pdf'),
            ).rejects.toThrow('Cloudinary upload failed');
        });
    });

    describe('generateSignedUrl (Edge Cases)', () => {
        it('calculates past expiration dates without crashing when expiresInSeconds is negative', () => {
            const mockUrl = 'https://cloudinary.example/expired';
            const now = 1_700_000_000; // Secunde

            jest.spyOn(Date, 'now').mockReturnValue(now * 1000); // Milisecunde

            (cloudinary.utils.private_download_url as jest.Mock).mockReturnValue(mockUrl);

            // Setăm expirarea la -60 de secunde (URL deja expirat)
            const result = service.generateSignedUrl('doc-123', 'pdf', -60);

            expect(result).toBe(mockUrl);
            expect(cloudinary.utils.private_download_url).toHaveBeenCalledWith(
                'doc-123',
                'pdf',
                expect.objectContaining({
                    expires_at: now - 60, // Verificăm dacă a făcut scăderea corect
                }),
            );

            jest.restoreAllMocks();
        });
    });

    describe('deleteDocument (Edge Cases)', () => {
        it('resolves gracefully if the document is already missing ("not found")', async () => {
            (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
                result: 'not found',
            });

            // Promisiunea trebuie să se rezolve, nu să arunce eroare
            await expect(
                service.deleteDocument('missing-doc-123'),
            ).resolves.toBeUndefined();
        });

        it('throws an error if Cloudinary returns an unexpected status string', async () => {
            (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({
                result: 'timeout', // Orice altceva în afară de 'ok' sau 'not found'
            });

            await expect(
                service.deleteDocument('doc-123'),
            ).rejects.toThrow('Cloudinary delete failed');
        });

        it('bubbles up the error if the Cloudinary destroy method completely rejects', async () => {
            const networkError = new Error('Network connection lost');
            (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(networkError);

            await expect(
                service.deleteDocument('doc-123'),
            ).rejects.toThrow('Network connection lost');
        });
    });
});
