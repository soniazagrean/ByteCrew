export interface AcademicDocument {
    id: string;
    title: string;
    course: string;
    year: number;
    specialization: string;
    tags: string[];
    fileUrl: string;
    fileType: 'pdf' | 'docx';
    sizeBytes: number;
    downloadCount: number;
    uploaderId: string;
    createdAt: string;
}