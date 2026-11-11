import { Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AntivirusService } from '../integrations/antivirus/antivirus.service';
import { StorageService } from '../integrations/storage/storage.service';
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

    const { key } = await this.storage.putObject({
      key: `documents/${randomUUID()}.${file.ext}`,
      body: file.buffer,
      contentType: file.mimeType,
    });

    return { fileKey: key, fileType: file.ext, sizeBytes: file.sizeBytes };
  }
}
