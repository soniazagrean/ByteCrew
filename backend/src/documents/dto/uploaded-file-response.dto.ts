import { ApiProperty } from '@nestjs/swagger';
import { DOCUMENT_ALLOWED_TYPES, DocumentFileExt } from '../upload/upload.constants';

export class UploadedFileResponseDto {
  @ApiProperty({
    description: 'Cloudinary public_id of the uploaded file (use it for signed URLs and delete)',
    example: 'k3j9x2mq8v1z7r4t',
  })
  fileKey!: string;

  @ApiProperty({ description: 'Detected file type', enum: Object.keys(DOCUMENT_ALLOWED_TYPES), example: 'pdf' })
  fileType!: DocumentFileExt;

  @ApiProperty({ description: 'File size in bytes', example: 48213 })
  sizeBytes!: number;
}
