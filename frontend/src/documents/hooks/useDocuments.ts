import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AcademicDocument } from '../../../types/document';
import {
  documentsApi,
  DocumentFilters,
  UploadDocumentPayload,
} from '../api/documents.api';

export function useDocuments(filters: DocumentFilters) {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: () => documentsApi.getDocuments(filters),
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const mutation = useMutation({
    mutationFn: (payload: UploadDocumentPayload) => {
      setUploadProgress(0);
      return documentsApi.uploadDocument(payload, (percent) => {
        setUploadProgress(percent);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const resetProgress = () => setUploadProgress(0);

  return {
    ...mutation,
    uploadProgress,
    resetProgress,
  };
}

export function useDownloadDocument() {
  const queryClient = useQueryClient();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (doc: AcademicDocument) => {
      setDownloadingId(doc.id);
      try {
        return await documentsApi.downloadDocument(doc);
      } finally {
        setDownloadingId(null);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  return {
    ...mutation,
    downloadingId,
  };
}