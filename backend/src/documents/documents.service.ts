import { Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AntivirusService } from '../integrations/antivirus/antivirus.service';
import { StorageService } from '../storage/storage.service';
import { UploadedFileResponseDto } from './dto/uploaded-file-response.dto';
import { ValidatedDocumentFile } from './upload/upload.constants';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly antivirus: AntivirusService,
    private readonly storage: StorageService,
  ) {}

  async upload(file: ValidatedDocumentFile): Promise<UploadedFileResponseDto> {
    const scan = await this.antivirus.scan(file.buffer);
    if (!scan.clean) {
      this.logger.warn(`Rejected infected upload: ${scan.signature} (${file.sizeBytes} bytes, .${file.ext})`);
      throw new UnprocessableEntityException('The file was rejected by the virus scanner.');
    }

    // Never use the client-supplied filename: store under a server-generated name.
    const uploaded = await this.storage.uploadDocument(file.buffer, `${randomUUID()}.${file.ext}`);

    return { fileKey: uploaded.public_id, fileType: file.ext, sizeBytes: file.sizeBytes };
  }
}
