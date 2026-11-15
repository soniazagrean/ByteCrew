import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export enum DocumentSortBy {
  NEWEST = 'newest',
  MOST_DOWNLOADED = 'mostDownloaded',
}

export class SearchDocumentsDto {
  @ApiPropertyOptional({ description: 'Filter by course name (case-insensitive, exact match)' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  course?: string;

  @ApiPropertyOptional({ description: 'Filter by study year (1-6)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(6)
  year?: number;

  @ApiPropertyOptional({ description: 'Filter by specialization (case-insensitive, exact match)' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  specialization?: string;

  @ApiPropertyOptional({ description: 'Free-text search over title and tags' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  q?: string;

  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Results per page (max 100)', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: DocumentSortBy, default: DocumentSortBy.NEWEST })
  @IsOptional()
  @IsEnum(DocumentSortBy)
  sortBy?: DocumentSortBy = DocumentSortBy.NEWEST;
}
