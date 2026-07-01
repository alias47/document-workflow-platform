'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

interface CreateNoteDialogProps {
  isOpen: boolean;
  isPending: boolean;
  onSubmit: (content: string) => void;
  onCancel: () => void;
}

const MAX_CHARS = 5000;

export function CreateNoteDialog({ isOpen, isPending, onSubmit, onCancel }: CreateNoteDialogProps) {
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const trimmed = content.trim();
  const isValid = trimmed.length > 0 && trimmed.length <= MAX_CHARS;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit(trimmed);
    setContent('');
  }

  function handleCancel() {
    setContent('');
    onCancel();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-note-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15,23,42,0.4)',
          backdropFilter: 'blur(2px)',
        }}
        onClick={handleCancel}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'relative',
          background: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(15,23,42,0.15)',
          width: '100%',
          maxWidth: '520px',
          padding: '24px',
        }}
      >
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          aria-label="Close dialog"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
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
          <X size={16} />
        </button>

        <h2
          id="create-note-title"
          style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '16px' }}
        >
          Add Note
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '8px' }}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here…"
              rows={6}
              maxLength={MAX_CHARS}
              disabled={isPending}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#0F172A',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div
            style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '20px', textAlign: 'right' }}
          >
            {content.length} / {MAX_CHARS}
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid} loading={isPending}>
              Save Note
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
