import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
    IsArray,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

export class CreateDocumentDto {
    @ApiProperty({
        description: 'Titlul documentului / cursului',
        example: 'EDP - Examen Sesiune Iarna 2026',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(150)
    title: string;

    @ApiProperty({
        description: 'Numele materiei / cursului',
        example: 'Ecuatii cu Derivate Partiale',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    course: string;

    @ApiProperty({
        description: 'Anul de studiu caruia ii este destinat materialul (1 - 6)',
        example: 3,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(6)
    year: number;

    @ApiProperty({
        description: 'Specializarea / profilul academic',
        example: 'Matematica Informatica',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    specialization: string;

    @ApiProperty({
        description: 'Lista de etichete pentru cautare rapida',
        example: ['examen', 'sesiune', 'edp'],
        required: false,
        type: [String],
    })
    @IsOptional()
    @Transform(({ value }) => {
        // Permite atat trimiterea ca array direct, cat si string separat prin virgula din multipart/form-data
        if (typeof value === 'string') {
            return value
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);
        }
        return value;
    })
    @IsArray()git diff origin/main
    @IsString({ each: true })
    tags?: string[];
}