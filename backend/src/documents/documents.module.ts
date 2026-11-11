import { Module } from '@nestjs/common';
import { AntivirusService } from '../integrations/antivirus/antivirus.service';
import { StorageService } from '../integrations/storage/storage.service';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, AntivirusService, StorageService],
})
export class DocumentsModule {}
