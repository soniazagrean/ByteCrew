import { Module } from '@nestjs/common';
import { AntivirusService } from '../integrations/antivirus/antivirus.service';
import { StorageModule } from '../storage/storage.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [StorageModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, AntivirusService],
})
export class DocumentsModule {}
