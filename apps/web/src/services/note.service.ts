import type { ApiResponse } from '@/types/api';

import { http } from '@/lib/http';

export interface NoteAuthor {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ApplicantNote {
  id: string;
  organizationId: string;
  applicantId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
  author: NoteAuthor;
}

export interface CreateNotePayload {
  content: string;
}

export interface UpdateNotePayload {
  content: string;
}

export const noteService = {
  async list(applicantId: string): Promise<ApplicantNote[]> {
    const res = await http.get<ApiResponse<ApplicantNote[]>>(`/applicants/${applicantId}/notes`);
    return res.data.data;
  },

  async create(applicantId: string, payload: CreateNotePayload): Promise<ApplicantNote> {
    const res = await http.post<ApiResponse<ApplicantNote>>(
      `/applicants/${applicantId}/notes`,
      payload,
    );
    return res.data.data;
  },

  async update(noteId: string, payload: UpdateNotePayload): Promise<ApplicantNote> {
    const res = await http.patch<ApiResponse<ApplicantNote>>(`/notes/${noteId}`, payload);
    return res.data.data;
  },

  async remove(noteId: string): Promise<void> {
    await http.delete(`/notes/${noteId}`);
  },
};
