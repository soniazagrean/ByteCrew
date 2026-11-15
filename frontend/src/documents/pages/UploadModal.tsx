import React, { useState, useRef, DragEvent, ChangeEvent, KeyboardEvent, useEffect } from 'react';
import { useUploadDocument } from '../hooks/useDocuments';
import {
  UBB_FMI_SPECIALIZATIONS,
  UBB_FMI_SEMESTERS,
  getYearsForSpecialization,
  getCoursesForSelection,
} from '../constants/fmiCatalogData';

export interface UploadModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  defaultFilters?: {
    specialization?: string;
    year?: number | '';
    semester?: number | '';
  };
}

const SUGGESTED_TAGS = ['examen', 'practic', 'curs', 'laborator', 'rezolvari', 'restanta', 'barem'];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export function UploadModal({ isOpen = true, onClose, defaultFilters }: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { mutateAsync: uploadDoc, isPending, uploadProgress, resetProgress } = useUploadDocument();

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [title, setTitle] = useState('');
  const [specialization, setSpecialization] = useState<string>(
    defaultFilters?.specialization || UBB_FMI_SPECIALIZATIONS[0]
  );
  const [year, setYear] = useState<number>(
    defaultFilters?.year ? Number(defaultFilters.year) : 1
  );
  const [semester, setSemester] = useState<number>(
    defaultFilters?.semester ? Number(defaultFilters.semester) : 1
  );
  const [course, setCourse] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (defaultFilters?.specialization) setSpecialization(defaultFilters.specialization);
      if (defaultFilters?.year) setYear(Number(defaultFilters.year));
      if (defaultFilters?.semester) setSemester(Number(defaultFilters.semester));
    }
  }, [isOpen, defaultFilters]);

  const availableYears = getYearsForSpecialization(specialization);
  const availableCourses = getCoursesForSelection(specialization, year, semester);

  if (!isOpen) return null;

  const validateAndSelectFile = (selected: File) => {
    setError(null);
    const ext = selected.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      setError('Format invalid. Sunt acceptate doar fișiere .PDF sau .DOCX.');
      return;
    }
    if (selected.size > MAX_FILE_SIZE_BYTES) {
      setError('Fișierul depășește limita maximă de 25 MB.');
      return;
    }

    setFile(selected);
    if (!title) {
      const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isPending) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isPending) return;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSelectFile(droppedFile);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndSelectFile(selected);
    }
  };

  const addTag = (rawTag: string) => {
    const cleaned = rawTag.trim().toLowerCase().replace(/^#/, '');
    if (cleaned && !tags.includes(cleaned) && tags.length < 8) {
      setTags([...tags, cleaned]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleClose = () => {
    if (isPending) return;
    setFile(null);
    setTitle('');
    setCourse('');
    setTags([]);
    setTagInput('');
    setError(null);
    setIsSuccess(false);
    resetProgress();
    onClose?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Te rugăm să selectezi un fișier PDF sau DOCX.');
      return;
    }
    if (!title.trim() || !course.trim()) {
      setError('Completează titlul documentului și selectează/introdu materia.');
      return;
    }

    try {
      await uploadDoc({
        file,
        title,
        specialization,
        year,
        semester,
        course,
        tags,
      });
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1100);
    } catch {
      setError('A apărut o eroare la încărcare. Încearcă din nou.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Încarcă un document FMI</h2>
            <p className="text-xs text-slate-500">
              Subiecte de examen, teste practice, cursuri sau rezolvări UBB FMI Cluj
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            aria-label="Închide"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isSuccess && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-medium text-emerald-700 flex items-center gap-2">
              <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Documentul a fost încărcat cu succes în arhiva FMI!
            </div>
          )}

          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/70'
                  : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-slate-100/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-800">
                Trage fișierul aici sau <span className="text-indigo-600 underline">alege din calculator</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">Doar PDF sau DOCX (maxim 25 MB)</p>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/50 p-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold uppercase text-white">
                  {file.name.split('.').pop()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                </div>
              </div>
              {!isPending && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="ml-3 rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-red-600"
                  title="Elimină fișierul"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Titlu document *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
              placeholder="ex: Subiecte Examen Sesiune Iarnă + Barem"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Specializare (UBB FMI Cluj) *
            </label>
            <select
              value={specialization}
              onChange={(e) => {
                const nextSpec = e.target.value;
                setSpecialization(nextSpec);
                if (!getYearsForSpecialization(nextSpec).includes(year)) {
                  setYear(1);
                }
                setCourse('');
              }}
              disabled={isPending}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100"
            >
              {UBB_FMI_SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                An de studiu *
              </label>
              <select
                value={year}
                onChange={(e) => {
                  setYear(Number(e.target.value));
                  setCourse('');
                }}
                disabled={isPending}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    Anul {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Semestru *
              </label>
              <select
                value={semester}
                onChange={(e) => {
                  setSemester(Number(e.target.value));
                  setCourse('');
                }}
                disabled={isPending}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100"
              >
                {UBB_FMI_SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    Semestrul {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Materie (Curs) *
            </label>
            <input
              type="text"
              list="fmi-courses-list"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              disabled={isPending}
              placeholder={
                availableCourses.length > 0
                  ? `Alege din listă sau scrie (ex: ${availableCourses[0]})`
                  : 'Introdu numele materiei...'
              }
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none disabled:bg-slate-100"
            />
            <datalist id="fmi-courses-list">
              {availableCourses.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {availableCourses.length > 0 && (
              <p className="mt-1 text-[11px] text-slate-400">
                Materii disponibile pentru Anul {year}, Semestrul {semester}: {availableCourses.length}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tag-uri (apasă Enter sau virgulă)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 focus-within:border-indigo-500">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
                >
                  #{tag}
                  {!isPending && (
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-indigo-400 hover:text-indigo-700"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                disabled={isPending}
                placeholder={tags.length === 0 ? 'ex: examen, practic, rezolvari...' : ''}
                className="min-w-[120px] flex-1 border-none bg-transparent text-sm text-slate-900 focus:outline-none"
              />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-slate-400">Sugestii:</span>
              {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={isPending}
                  onClick={() => addTag(suggestion)}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
                >
                  +{suggestion}
                </button>
              ))}
            </div>
          </div>

          {(isPending || uploadProgress > 0) && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-medium text-slate-600">
                <span>Se încarcă documentul...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Anulează
            </button>
            <button
              type="submit"
              disabled={isPending || !file}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-xs hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? 'Se încarcă...' : 'Publică documentul'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}