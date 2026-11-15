import { AcademicDocument } from '../../../types/document';

export interface DocumentFilters {
  search?: string;
  specialization?: string;
  year?: number | '';
  semester?: number | '';
  fileType?: 'pdf' | 'docx' | '';
}

export interface UploadDocumentPayload {
  file: File;
  title: string;
  specialization: string;
  year: number;
  semester: number;
  course: string;
  tags: string[];
}

// Date inițiale conform schemei AcademicDocument (BYT-81)
let mockDocuments: AcademicDocument[] = [
  {
    id: 'doc-1',
    title: 'Subiecte Examen Sesiune Iarnă + Rezolvări Complete',
    course: 'Sisteme de Operare',
    year: 2,
    semester: 1,
    specialization: 'Informatică',
    tags: ['examen', 'rezolvari', 'sesiune', 'linux'],
    fileKey: 'docs/so-examen-2025.pdf',
    fileType: 'pdf',
    sizeBytes: 2457600, // ~2.4 MB
    downloadCount: 142,
    uploaderId: 'stud-101',
    createdAt: '2026-01-18T10:30:00Z',
  },
  {
    id: 'doc-2',
    title: 'Sinteze Curs 1-12 & Întrebări Tip Grilă',
    course: 'Baze de Date',
    year: 2,
    semester: 2,
    specialization: 'Calculatoare',
    tags: ['curs', 'grile', 'sql', 'sinteza'],
    fileKey: 'docs/bd-sinteze.docx',
    fileType: 'docx',
    sizeBytes: 1280000, // ~1.25 MB
    downloadCount: 98,
    uploaderId: 'stud-204',
    createdAt: '2026-02-10T14:15:00Z',
  },
  {
    id: 'doc-3',
    title: 'Formularistică și Modele Probleme Colocviu',
    course: 'Analiză Matematică',
    year: 1,
    semester: 1,
    specialization: 'Automatică și Informatică Aplicată',
    tags: ['colocviu', 'formule', 'integrale'],
    fileKey: 'docs/am-colocviu.pdf',
    fileType: 'pdf',
    sizeBytes: 3670016, // ~3.5 MB
    downloadCount: 215,
    uploaderId: 'stud-089',
    createdAt: '2025-11-22T09:00:00Z',
  },
  {
    id: 'doc-4',
    title: 'Ghid Proiect + Exemple Diagrame UML',
    course: 'Ingineria Programării',
    year: 3,
    semester: 1,
    specialization: 'Informatică',
    tags: ['proiect', 'uml', 'design-patterns'],
    fileKey: 'docs/ip-proiect-uml.pdf',
    fileType: 'pdf',
    sizeBytes: 1945600, // ~1.9 MB
    downloadCount: 76,
    uploaderId: 'stud-312',
    createdAt: '2025-12-05T16:45:00Z',
  },
  {
    id: 'doc-5',
    title: 'Rezolvare Laboratoare 1-10 (C++ / OOP)',
    course: 'Programare Orientată pe Obiecte',
    year: 1,
    semester: 2,
    specialization: 'Calculatoare',
    tags: ['laborator', 'cpp', 'cod'],
    fileKey: 'docs/poo-labs.docx',
    fileType: 'docx',
    sizeBytes: 890000, // ~870 KB
    downloadCount: 184,
    uploaderId: 'stud-155',
    createdAt: '2026-04-02T11:20:00Z',
  },
  {
    id: 'doc-6',
    title: 'Subiecte Restanță + Barem Oficial',
    course: 'Rețele de Calculatoare',
    year: 3,
    semester: 2,
    specialization: 'Calculatoare',
    tags: ['restanta', 'barem', 'subnetting'],
    fileKey: 'docs/rc-restanta.pdf',
    fileType: 'pdf',
    sizeBytes: 1572864, // 1.5 MB
    downloadCount: 63,
    uploaderId: null,
    createdAt: '2026-09-01T08:10:00Z',
  },
];

export const documentsApi = {
  async getDocuments(filters: DocumentFilters): Promise<AcademicDocument[]> {
    // Simulăm latența rețelei
    await new Promise((resolve) => setTimeout(resolve, 250));

    return mockDocuments.filter((doc) => {
      if (filters.specialization && doc.specialization !== filters.specialization) {
        return false;
      }
      if (filters.year !== '' && filters.year !== undefined && doc.year !== Number(filters.year)) {
        return false;
      }
      if (
        filters.semester !== '' &&
        filters.semester !== undefined &&
        doc.semester !== Number(filters.semester)
      ) {
        return false;
      }
      if (filters.fileType && doc.fileType !== filters.fileType) {
        return false;
      }
      if (filters.search && filters.search.trim() !== '') {
        const q = filters.search.toLowerCase().trim();
        const matchesTitle = doc.title.toLowerCase().includes(q);
        const matchesCourse = doc.course.toLowerCase().includes(q);
        const matchesSpec = doc.specialization.toLowerCase().includes(q);
        const matchesTags = doc.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCourse && !matchesSpec && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  },

  async uploadDocument(
    payload: UploadDocumentPayload,
    onProgress?: (percent: number) => void
  ): Promise<AcademicDocument> {
    // Simulăm progresul real al upload-ului (0% -> 100%)
    for (let progress = 10; progress <= 100; progress += 15) {
      await new Promise((resolve) => setTimeout(resolve, 180));
      onProgress?.(Math.min(progress, 100));
    }

    const extension = payload.file.name.split('.').pop()?.toLowerCase();
    const fileType: 'pdf' | 'docx' = extension === 'docx' ? 'docx' : 'pdf';

    const newDoc: AcademicDocument = {
      id: `doc-${Date.now()}`,
      title: payload.title.trim(),
      course: payload.course.trim(),
      year: payload.year,
      semester: payload.semester,
      specialization: payload.specialization,
      tags: payload.tags,
      fileKey: `uploads/${Date.now()}-${payload.file.name}`,
      fileType,
      sizeBytes: payload.file.size,
      downloadCount: 0,
      uploaderId: 'current-student',
      createdAt: new Date().toISOString(),
    };

    mockDocuments = [newDoc, ...mockDocuments];
    return newDoc;
  },

  async downloadDocument(doc: AcademicDocument): Promise<AcademicDocument> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Incrementăm contorul de descărcări
    mockDocuments = mockDocuments.map((item) =>
      item.id === doc.id ? { ...item, downloadCount: item.downloadCount + 1 } : item
    );

    // Declanșăm descărcarea unui fișier demonstrativ în browser
    const content = [
      `Titlu: ${doc.title}`,
      `Materie: ${doc.course}`,
      `Specializare: ${doc.specialization} | Anul ${doc.year}, Semestrul ${doc.semester}`,
      `Tag-uri: ${doc.tags.map((t) => '#' + t).join(', ')}`,
      `Cheie stocare: ${doc.fileKey}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.title.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'document'}.${doc.fileType}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { ...doc, downloadCount: doc.downloadCount + 1 };
  },
};