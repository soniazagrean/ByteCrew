import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Document, DocumentStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { AntivirusService } from '../integrations/antivirus/antivirus.service';
import { StorageService } from '../storage/storage.service';
import { DocumentResponseDto } from './dto/document-response.dto';
import { PaginatedDocumentsDto } from './dto/paginated-documents.dto';
import { DocumentSortBy, SearchDocumentsDto } from './dto/search-documents.dto';
import { UploadedFileResponseDto } from './dto/uploaded-file-response.dto';
import { ValidatedDocumentFile } from './upload/upload.constants';

function toDocumentResponseDto(document: Document): DocumentResponseDto {
  return {
    id: document.id,
    title: document.title,
    course: document.course,
    year: document.year,
    semester: document.semester,
    specialization: document.specialization,
    tags: document.tags,
    fileKey: document.fileKey,
    fileType: document.fileType,
    sizeBytes: document.sizeBytes,
    downloadCount: document.downloadCount,
    uploaderId: document.uploaderId,
    createdAt: document.createdAt,
  };
}

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly antivirus: AntivirusService,
    private readonly storage: StorageService,
    private readonly prisma: PrismaService,
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

  async search(query: SearchDocumentsDto): Promise<PaginatedDocumentsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = query.sortBy ?? DocumentSortBy.NEWEST;

    const where: Prisma.DocumentWhereInput = {
      status: DocumentStatus.visible,
      ...(query.course && { course: { equals: query.course, mode: 'insensitive' } }),
      ...(query.year !== undefined && { year: query.year }),
      ...(query.specialization && { specialization: { equals: query.specialization, mode: 'insensitive' } }),
      ...(query.q && {
        OR: [{ title: { contains: query.q, mode: 'insensitive' } }, { tags: { has: query.q } }],
      }),
    };

    const orderBy: Prisma.DocumentOrderByWithRelationInput =
      sortBy === DocumentSortBy.MOST_DOWNLOADED ? { downloadCount: 'desc' } : { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      items: items.map(toDocumentResponseDto),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async getDownloadUrl(id: string): Promise<{ url: string }> {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document || document.status !== DocumentStatus.visible) {
      throw new NotFoundException('Document not found.');
    }

    await this.prisma.document.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });

    return { url: this.storage.generateSignedUrl(document.fileKey, document.fileType) };
  }
}
