import { AcademicDocument } from '../../../types/document';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

// Stocare locală în memorie pentru modul offline/demo (când backend-ul nu rulează)
const uploadedFilesStore = new Map<string, File>();

function createValidDummyPdfBlob(doc: AcademicDocument): Blob {
  // Eliminăm diacriticele pentru fontul standard PDF Helvetica (WinAnsi)
  const cleanText = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[()\\]/g, '')
      .replace(/[^\x20-\x7E]/g, '');

  const title = cleanText(doc.title);
  const course = cleanText(doc.course);
  const spec = cleanText(doc.specialization);

  const streamContent = [
    'BT',
    '/F1 16 Tf',
    '50 740 Td',
    `(${title}) Tj`,
    '0 -28 Td',
    '/F1 12 Tf',
    `(Materie: ${course}) Tj`,
    '0 -20 Td',
    `(Specializare: ${spec} | Anul ${doc.year}, Semestrul ${doc.semester}) Tj`,
    '0 -30 Td',
    '/F1 10 Tf',
    '(Document demonstrativ - Arhiva Studenteasca UBB FMI) Tj',
    'ET',
  ].join('\n');

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    `5 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
  ];

  const header = '%PDF-1.4\n';
  let body = '';
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(header.length + body.length);
    body += obj;
  }

  const xrefStart = header.length + body.length;
  const xrefLines = [
    'xref',
    `0 ${objects.length + 1}`,
    '0000000000 65535 f ',
    ...offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `),
  ];

  const trailer = [
    'trailer',
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    'startxref',
    String(xrefStart),
    '%%EOF',
  ];

  const fullPdf = header + body + xrefLines.join('\n') + '\n' + trailer.join('\n');
  return new Blob([fullPdf], { type: 'application/pdf' });
}

let mockDocuments: AcademicDocument[] = [
  {
    id: '11111111-1111-4111-8111-111111111101',
    title: 'Subiecte Examen Sesiune Iarnă + Rezolvări Procese și Thread-uri',
    course: 'Sisteme de Operare',
    year: 1,
    semester: 2,
    specialization: 'Informatică (Română)',
    tags: ['examen', 'rezolvari', 'sesiune', 'bash', 'c'],
    fileKey: 'fmi/so-examen-2026.pdf',
    fileType: 'pdf',
    sizeBytes: 2457600,
    downloadCount: 189,
    uploaderId: 'stud-fmi-101',
    createdAt: '2026-06-15T10:30:00Z',
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    title: 'Modele Test Practic + Arhitectură Layered (C# / Java)',
    course: 'Metode Avansate de Programare',
    year: 2,
    semester: 1,
    specialization: 'Informatică (Română)',
    tags: ['practic', 'map', 'design-patterns', 'examen'],
    fileKey: 'fmi/map-practic.docx',
    fileType: 'docx',
    sizeBytes: 1280000,
    downloadCount: 142,
    uploaderId: 'stud-fmi-204',
    createdAt: '2026-01-20T14:15:00Z',
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    title: 'Exam Subjects + Solutions (Backtracking & Divide et Impera)',
    course: 'Fundamentals of Programming',
    year: 1,
    semester: 1,
    specialization: 'Informatică (Engleză)',
    tags: ['exam', 'python', 'recursion', 'session'],
    fileKey: 'fmi/fp-en-exam.pdf',
    fileType: 'pdf',
    sizeBytes: 3120000,
    downloadCount: 231,
    uploaderId: 'stud-fmi-089',
    createdAt: '2026-01-28T09:00:00Z',
  },
  {
    id: '11111111-1111-4111-8111-111111111104',
    title: 'Formularistică Serii, Integrale Duble și Criterii de Convergență',
    course: 'Analiză Matematică II (Calcul Integral)',
    year: 1,
    semester: 2,
    specialization: 'Matematică Informatică (Română)',
    tags: ['formule', 'sinteza', 'examen', 'integrale'],
    fileKey: 'fmi/am2-formule.pdf',
    fileType: 'pdf',
    sizeBytes: 1945600,
    downloadCount: 114,
    uploaderId: 'stud-fmi-312',
    createdAt: '2026-05-30T16:45:00Z',
  },
  {
    id: '11111111-1111-4111-8111-111111111105',
    title: 'Lecture Notes & Gradient Descent Proofs',
    course: 'Machine Learning',
    year: 2,
    semester: 1,
    specialization: 'Inteligență Artificială (Engleză)',
    tags: ['notes', 'ml', 'exam', 'math'],
    fileKey: 'fmi/ml-notes.pdf',
    fileType: 'pdf',
    sizeBytes: 4194304,
    downloadCount: 97,
    uploaderId: 'stud-fmi-155',
    createdAt: '2026-02-04T11:20:00Z',
  },
  {
    id: '11111111-1111-4111-8111-111111111106',
    title: 'Subiecte Restanță + Barem Oficial (Prolog & Lisp)',
    course: 'Programare Logică și Funcțională',
    year: 2,
    semester: 1,
    specialization: 'Informatică (Română)',
    tags: ['restanta', 'barem', 'prolog', 'lisp'],
    fileKey: 'fmi/plf-restanta.docx',
    fileType: 'docx',
    sizeBytes: 980000,
    downloadCount: 164,
    uploaderId: null,
    createdAt: '2026-09-02T08:10:00Z',
  },
];

function filterMockDocuments(filters: DocumentFilters): AcademicDocument[] {
  return mockDocuments.filter((doc) => {
    if (filters.specialization && doc.specialization !== filters.specialization) return false;
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
    if (filters.fileType && doc.fileType !== filters.fileType) return false;
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      const matchesTitle = doc.title.toLowerCase().includes(q);
      const matchesCourse = doc.course.toLowerCase().includes(q);
      const matchesSpec = doc.specialization.toLowerCase().includes(q);
      const matchesTags = doc.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchesTitle && !matchesCourse && !matchesSpec && !matchesTags) return false;
    }
    return true;
  });
}

function uploadErrorMessage(status: number, responseText: string): string {
  let reason: unknown;
  try {
    reason = JSON.parse(responseText).message;
  } catch {
    // răspuns non-JSON (ex. de la un proxy)
  }
  const detail = Array.isArray(reason) ? reason.join(', ') : reason;
  return `Încărcarea a eșuat (${status})${typeof detail === 'string' ? `: ${detail}` : '.'}`;
}

export const documentsApi = {
  async getDocuments(filters: DocumentFilters): Promise<AcademicDocument[]> {
    const params = new URLSearchParams();
    if (filters.search?.trim()) params.set('q', filters.search.trim());
    if (filters.specialization) params.set('specialization', filters.specialization);
    if (filters.year !== '' && filters.year !== undefined) params.set('year', String(filters.year));

    try {
      const response = await fetch(`${API_BASE_URL}/documents?${params.toString()}`);
      if (!response.ok) throw new Error('Backend unavailable');

      const data: { items: AcademicDocument[] } = await response.json();
      // Filtrăm local semestrul și tipul fișierului (deoarece SearchDocumentsDto are q, course, year, specialization)
      return data.items.filter((doc) => {
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
        return true;
      });
    } catch {
      // Fallback pe datele mock UBB FMI dacă serverul backend nu este pornit
      return filterMockDocuments(filters);
    }
  },

  async uploadDocument(
    payload: UploadDocumentPayload,
    onProgress?: (percent: number) => void
  ): Promise<AcademicDocument> {
    // Apel către POST /documents/upload (Multipart + Cloudinary + Antivirus).
    // Orice eșec este propagat: un fișier respins nu trebuie afișat ca încărcat.
    const uploadedMeta = await new Promise<{
      fileKey: string;
      fileType: 'pdf' | 'docx';
      sizeBytes: number;
    }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/documents/upload`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress?.(Math.round((event.loaded / event.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(uploadErrorMessage(xhr.status, xhr.responseText)));
        }
      };

      xhr.onerror = () => reject(new Error('Nu s-a putut contacta serverul. Încearcă din nou.'));

      const formData = new FormData();
      formData.append('file', payload.file);
      xhr.send(formData);
    });

    const newDoc: AcademicDocument = {
      id: crypto.randomUUID(),
      title: payload.title.trim(),
      course: payload.course.trim(),
      year: payload.year,
      semester: payload.semester,
      specialization: payload.specialization,
      tags: payload.tags,
      fileKey: uploadedMeta.fileKey,
      fileType: uploadedMeta.fileType,
      sizeBytes: uploadedMeta.sizeBytes,
      downloadCount: 0,
      uploaderId: 'current-student',
      createdAt: new Date().toISOString(),
    };

    uploadedFilesStore.set(newDoc.id, payload.file);
    mockDocuments = [newDoc, ...mockDocuments];
    return newDoc;
  },

  async downloadDocument(doc: AcademicDocument): Promise<AcademicDocument> {
    try {
      // Apel real către GET /documents/:id/download (incrementează downloadCount și returnează URL semnat Cloudinary)
      const response = await fetch(`${API_BASE_URL}/documents/${doc.id}/download`);
      if (!response.ok) throw new Error('Download endpoint unavailable');

      const { url }: { url: string } = await response.json();
      window.open(url, '_blank', 'noopener,noreferrer');

      return { ...doc, downloadCount: doc.downloadCount + 1 };
    } catch {
      // Fallback local: descarcă fișierul real încărcat în sesiune sau un PDF binar valid
      mockDocuments = mockDocuments.map((item) =>
        item.id === doc.id ? { ...item, downloadCount: item.downloadCount + 1 } : item
      );

      const realUploadedFile = uploadedFilesStore.get(doc.id);
      const blob = realUploadedFile ? realUploadedFile : createValidDummyPdfBlob(doc);
      const fileName = realUploadedFile
        ? realUploadedFile.name
        : `${doc.title.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'document'}.pdf`;

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      return { ...doc, downloadCount: doc.downloadCount + 1 };
    }
  },
};