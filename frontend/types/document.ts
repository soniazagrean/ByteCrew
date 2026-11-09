export interface AcademicDocument {
    id: string;
    title: string;
    course: string;
    year: number;
    semester: number;
    specialization: string;
    tags: string[];
    fileUrl: string;
    fileType: 'pdf' | 'docx';
    sizeBytes: number;
    downloadCount: number;
    uploaderId: string | null;
    createdAt: string;
}
