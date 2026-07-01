'use client';

import { AlertTriangle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface DeleteNoteDialogProps {
  isOpen: boolean;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteNoteDialog({
  isOpen,
  isPending,
  onConfirm,
  onCancel,
}: DeleteNoteDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-note-title"
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
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'relative',
          background: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(15,23,42,0.15)',
          width: '100%',
          maxWidth: '440px',
          padding: '24px',
        }}
      >
        <button
          type="button"
          onClick={onCancel}
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

        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: '#FFF1F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <AlertTriangle size={22} style={{ color: '#E11D48' }} />
        </div>

        <h2
          id="delete-note-title"
          style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}
        >
          Delete Note
        </h2>
        <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '24px' }}>
          Are you sure you want to delete this note? This action cannot be undone.
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={isPending}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
