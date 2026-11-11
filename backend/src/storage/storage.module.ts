import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { StorageService } from './storage.service';

@Module({
    providers: [
        CloudinaryProvider,
        StorageService,
    ],
    exports: [
        StorageService,
    ],
})
export class StorageModule {}