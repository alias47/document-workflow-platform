'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-keys';
import {
  type CreateNotePayload,
  type UpdateNotePayload,
  noteService,
} from '@/services/note.service';

export function useNotes(applicantId: string) {
  return useQuery({
    queryKey: queryKeys.notes.byApplicant(applicantId),
    queryFn: () => noteService.list(applicantId),
    enabled: Boolean(applicantId),
  });
}

export function useCreateNote(applicantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNotePayload) => noteService.create(applicantId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.byApplicant(applicantId) });
    },
  });
}

export function useUpdateNote(applicantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, payload }: { noteId: string; payload: UpdateNotePayload }) =>
      noteService.update(noteId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.byApplicant(applicantId) });
    },
  });
}

export function useDeleteNote(applicantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => noteService.remove(noteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.notes.byApplicant(applicantId) });
    },
  });
}
