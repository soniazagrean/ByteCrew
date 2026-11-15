import { DocumentResponseDto } from './document-response.dto';

export class PaginatedDocumentsDto {
  items!: DocumentResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
