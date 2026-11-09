export class DocumentResponseDto {
    id: string;
    title: string;
    course: string;
    year: number;
    semester: number;
    specialization: string;
    tags: string[];
    fileUrl: string;
    fileType: string;
    sizeBytes: number;
    downloadCount: number;
    uploaderId: string | null;
    createdAt: Date;
}
