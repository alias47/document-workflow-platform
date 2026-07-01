'use client';

import { Pencil, Plus, RefreshCw, StickyNote, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { CreateNoteDialog } from './CreateNoteDialog';
import { DeleteNoteDialog } from './DeleteNoteDialog';
import { EditNoteDialog } from './EditNoteDialog';
import { useCreateNote, useDeleteNote, useNotes, useUpdateNote } from '../hooks/use-notes';

import { Button } from '@/components/ui/button';
import { type ApplicantNote } from '@/services/note.service';

interface ApplicantNotesProps {
  applicantId: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function NotesSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            background: '#F8FAFC',
            borderRadius: '10px',
            padding: '16px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        >
          <div
            style={{
              height: '12px',
              background: '#E2E8F0',
              borderRadius: '4px',
              width: '30%',
              marginBottom: '10px',
            }}
          />
          <div
            style={{
              height: '14px',
              background: '#E2E8F0',
              borderRadius: '4px',
              width: '100%',
              marginBottom: '6px',
            }}
          />
          <div
            style={{ height: '14px', background: '#E2E8F0', borderRadius: '4px', width: '75%' }}
          />
        </div>
      ))}
    </div>
  );
}

function NotesEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 24px',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: '#EFF6FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <StickyNote size={24} style={{ color: '#2563EB' }} />
      </div>
      <p style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>No notes yet</p>
      <p style={{ fontSize: '13px', color: '#64748B', textAlign: 'center', maxWidth: '280px' }}>
        Add a note to record observations about this applicant.
      </p>
      <Button size="sm" onClick={onAdd}>
        <Plus size={14} />
        Add First Note
      </Button>
    </div>
  );
}

function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: ApplicantNote;
  onEdit: (note: ApplicantNote) => void;
  onDelete: (note: ApplicantNote) => void;
}) {
  const authorName = `${note.author.firstName} ${note.author.lastName}`;
  const wasEdited = note.updatedAt !== note.createdAt;

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        padding: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}
      >
        <div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>{authorName}</span>
          <span style={{ fontSize: '12px', color: '#94A3B8', marginLeft: '8px' }}>
            {formatDate(note.createdAt)}
            {wasEdited && <span style={{ marginLeft: '6px', fontStyle: 'italic' }}>(edited)</span>}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => onEdit(note)}
            aria-label="Edit note"
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
              borderRadius: '6px',
            }}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(note)}
            aria-label="Delete note"
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
              borderRadius: '6px',
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <p
        style={{
          fontSize: '14px',
          color: '#334155',
          lineHeight: '1.6',
          whiteSpace: 'pre-wrap',
          margin: 0,
        }}
      >
        {note.content}
      </p>
    </div>
  );
}

export function ApplicantNotes({ applicantId }: ApplicantNotesProps) {
  const { data: notes, isLoading, isError, refetch } = useNotes(applicantId);

  const createMutation = useCreateNote(applicantId);
  const updateMutation = useUpdateNote(applicantId);
  const deleteMutation = useDeleteNote(applicantId);

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<ApplicantNote | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApplicantNote | null>(null);

  function handleCreate(content: string) {
    createMutation.mutate({ content }, { onSuccess: () => setShowCreate(false) });
  }

  function handleUpdate(content: string) {
    if (!editTarget) return;
    updateMutation.mutate(
      { noteId: editTarget.id, payload: { content } },
      { onSuccess: () => setEditTarget(null) },
    );
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  }

  return (
    <div>
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>
          Notes {notes && notes.length > 0 ? `(${notes.length})` : ''}
        </span>
        {!isLoading && !isError && (
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus size={14} />
            Add Note
          </Button>
        )}
      </div>

      {/* Body */}
      {isLoading && <NotesSkeleton />}

      {isError && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '32px 24px',
            gap: '12px',
          }}
        >
          <p style={{ fontSize: '14px', color: '#64748B' }}>Failed to load notes.</p>
          <Button size="sm" variant="secondary" onClick={() => void refetch()}>
            <RefreshCw size={14} />
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && notes && notes.length === 0 && (
        <NotesEmpty onAdd={() => setShowCreate(true)} />
      )}

      {!isLoading && !isError && notes && notes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onEdit={setEditTarget} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateNoteDialog
        isOpen={showCreate}
        isPending={createMutation.isPending}
        onSubmit={handleCreate}
        onCancel={() => setShowCreate(false)}
      />
      <EditNoteDialog
        isOpen={editTarget !== null}
        isPending={updateMutation.isPending}
        initialContent={editTarget?.content ?? ''}
        onSubmit={handleUpdate}
        onCancel={() => setEditTarget(null)}
      />
      <DeleteNoteDialog
        isOpen={deleteTarget !== null}
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
