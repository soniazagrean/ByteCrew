import React, { useState } from 'react';
import { AcademicDocument } from '../../../types/document';
import { useDocuments, useDownloadDocument } from '../hooks/useDocuments';
import { UploadModal } from './UploadModal';
import {
  UBB_FMI_SPECIALIZATIONS,
  UBB_FMI_SEMESTERS,
  getYearsForSpecialization,
} from '../constants/fmiCatalogData';

export function DocumentCatalogPage() {
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [semester, setSemester] = useState<number | ''>('');
  const [fileType, setFileType] = useState<'pdf' | 'docx' | ''>('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const availableYears = getYearsForSpecialization(specialization);
  const filters = { search, specialization, year, semester, fileType };
  const { data: documents = [], isLoading } = useDocuments(filters);
  const { mutate: downloadDoc, downloadingId } = useDownloadDocument();

  const hasActiveFilters = Boolean(
    search || specialization || year !== '' || semester !== '' || fileType
  );

  const resetFilters = () => {
    setSearch('');
    setSpecialization('');
    setYear('');
    setSemester('');
    setFileType('');
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
            UBB Cluj • Facultatea de Matematică și Informatică
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Resurse & Examene FMI</h1>
          <p className="mt-1 text-sm text-slate-500">
            Subiecte din sesiune, teste practice, cursuri sintetizate și rezolvări pe specializări
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Încarcă document
        </button>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Caută după titlu, materie (ex: Sisteme de Operare, MAP, ML) sau tag (#examen)..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
          <select
            value={specialization}
            onChange={(e) => {
              const nextSpec = e.target.value;
              setSpecialization(nextSpec);
              if (year !== '' && !getYearsForSpecialization(nextSpec).includes(Number(year))) {
                setYear('');
              }
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Toate specializările FMI</option>
            {UBB_FMI_SPECIALIZATIONS.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(e.target.value ? Number(e.target.value) : '')}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Toți anii</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                Anul {y}
              </option>
            ))}
          </select>

          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value ? Number(e.target.value) : '')}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Ambele semestre</option>
            {UBB_FMI_SEMESTERS.map((s) => (
              <option key={s} value={s}>
                Semestrul {s}
              </option>
            ))}
          </select>

          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value as 'pdf' | 'docx' | '')}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Orice format (PDF / DOCX)</option>
            <option value="pdf">Doar PDF</option>
            <option value="docx">Doar DOCX</option>
          </select>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Resetează filtrele
            </button>
          ) : (
            <div className="flex items-center justify-center rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
              {documents.length} {documents.length === 1 ? 'document' : 'documente'}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="h-4 w-20 rounded bg-slate-200 mb-3" />
              <div className="h-5 w-3/4 rounded bg-slate-200 mb-2" />
              <div className="h-4 w-1/2 rounded bg-slate-200 mb-6" />
              <div className="h-9 w-full rounded-xl bg-slate-100 mt-auto" />
            </div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Nu am găsit niciun document
          </h3>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Nu există materiale care să corespundă filtrelor selectate. Poți reseta căutarea sau poți fi primul care încarcă un material aici.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Resetează filtrele
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Încarcă tu primul document
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc: AcademicDocument) => {
            const isDownloading = downloadingId === doc.id;
            const isPdf = doc.fileType === 'pdf';

            return (
              <div
                key={doc.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold uppercase ${
                        isPdf
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-sky-50 text-sky-700 border border-sky-200'
                      }`}
                    >
                      {doc.fileType}
                    </span>
                    <span className="text-xs text-slate-400">
                      An {doc.year} • Sem {doc.semester} • {formatBytes(doc.sizeBytes)}
                    </span>
                  </div>

                  <h3 className="line-clamp-2 text-base font-semibold text-slate-900">
                    {doc.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-indigo-600">{doc.course}</p>
                  <p className="text-xs text-slate-500">{doc.specialization}</p>

                  {doc.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {doc.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5">
                  <div className="text-xs text-slate-400">
                    <span>{formatDate(doc.createdAt)}</span>
                    <span className="mx-1.5">•</span>
                    <span>{doc.downloadCount} descărcări</span>
                  </div>

                  <button
                    type="button"
                    disabled={isDownloading}
                    onClick={() => downloadDoc(doc)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    {isDownloading ? 'Se descarcă...' : 'Descarcă'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        defaultFilters={{ specialization, year, semester }}
      />
    </div>
  );
}