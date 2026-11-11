import { ApiProperty } from '@nestjs/swagger';
import { DOCUMENT_ALLOWED_TYPES, DocumentFileExt } from '../upload/upload.constants';

export class UploadedFileResponseDto {
  @ApiProperty({
    description: 'Server-generated storage key of the uploaded file',
    example: 'documents/3f2c9a7e-1b4d-4c8e-9f0a-2d6b5e7c1a90.pdf',
  })
  fileKey!: string;

  @ApiProperty({ description: 'Detected file type', enum: Object.keys(DOCUMENT_ALLOWED_TYPES), example: 'pdf' })
  fileType!: DocumentFileExt;

  @ApiProperty({ description: 'File size in bytes', example: 48213 })
  sizeBytes!: number;
}
