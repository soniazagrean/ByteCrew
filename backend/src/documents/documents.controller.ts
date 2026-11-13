import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { PaginatedDocumentsDto } from './dto/paginated-documents.dto';
import { SearchDocumentsDto } from './dto/search-documents.dto';
import { UploadedFileResponseDto } from './dto/uploaded-file-response.dto';
import { DocumentFilePipe } from './upload/document-file.pipe';
import { DOCUMENT_FILE_FIELD, ValidatedDocumentFile } from './upload/upload.constants';
import { documentUploadOptions } from './upload/upload.options';

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  findAll(@Query() query: SearchDocumentsDto): Promise<PaginatedDocumentsDto> {
    return this.documentsService.search(query);
  }

  @Get(':id/download')
  getDownloadUrl(@Param('id', ParseUUIDPipe) id: string): Promise<{ url: string }> {
    return this.documentsService.getDownloadUrl(id);
  }

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor(DOCUMENT_FILE_FIELD, documentUploadOptions))
  upload(@UploadedFile(DocumentFilePipe) file: ValidatedDocumentFile): Promise<UploadedFileResponseDto> {
    return this.documentsService.upload(file);
  }
}
