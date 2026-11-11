import { Controller, HttpCode, HttpStatus, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { UploadedFileResponseDto } from './dto/uploaded-file-response.dto';
import { DocumentFilePipe } from './upload/document-file.pipe';
import { DOCUMENT_FILE_FIELD, ValidatedDocumentFile } from './upload/upload.constants';
import { documentUploadOptions } from './upload/upload.options';

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor(DOCUMENT_FILE_FIELD, documentUploadOptions))
  upload(@UploadedFile(DocumentFilePipe) file: ValidatedDocumentFile): Promise<UploadedFileResponseDto> {
    return this.documentsService.upload(file);
  }
}
