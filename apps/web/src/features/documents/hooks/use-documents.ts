'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import {
  type DocumentListParams,
  type UploadDocumentData,
  documentService,
} from '@/services/document.service';

export function useDocuments(params: DocumentListParams = {}) {
  return useQuery({
    queryKey: queryKeys.documents.list(params as Record<string, unknown>),
    queryFn: () => documentService.list(params),
    enabled: Boolean(params.applicantId),
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UploadDocumentData) => documentService.upload(data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documents.list({ applicantId: variables.applicantId }),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.lists() });
    },
  });
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: ({ id, filename }: { id: string; filename: string }) =>
      documentService.download(id, filename),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; applicantId: string }) => documentService.deleteFile(id),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.documents.list({ applicantId: variables.applicantId }),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.documents.lists() });
    },
  });
}
