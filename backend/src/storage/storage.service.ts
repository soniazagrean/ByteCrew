import { Inject, Injectable } from '@nestjs/common';
import { v2 as Cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class StorageService {
    constructor(
        @Inject('CLOUDINARY')
        private readonly cloudinary: typeof Cloudinary,
    ) {}

    uploadDocument(
        buffer: Buffer,
        originalName: string,
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = this.cloudinary.uploader.upload_stream(
                {
                    resource_type: 'raw',
                    type: 'authenticated',
                    asset_folder: 'student-hub/documents',
                    display_name: originalName,
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    if (!result) {
                        reject(new Error('Cloudinary upload failed'));
                        return;
                    }

                    resolve(result);
                },
            );

            uploadStream.end(buffer);
        });
    }

    generateSignedUrl(
        publicId: string,
        format: string,
        expiresInSeconds = 300,
    ): string {
        const expiresAt =
            Math.floor(Date.now() / 1000) + expiresInSeconds;

        return this.cloudinary.utils.private_download_url(
            publicId,
            format,
            {
                resource_type: 'raw',
                type: 'authenticated',
                expires_at: expiresAt,
            },
        );
    }

    async deleteDocument(publicId: string): Promise<void> {
        const result = await this.cloudinary.uploader.destroy(
            publicId,
            {
                resource_type: 'raw',
                type: 'authenticated',
                invalidate: true,
            },
        );

        if (result.result !== 'ok' && result.result !== 'not found') {
            throw new Error('Cloudinary delete failed');
        }
    }
}