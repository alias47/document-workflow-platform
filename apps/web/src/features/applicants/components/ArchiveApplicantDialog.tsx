'use client';

import { AlertTriangle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ArchiveApplicantDialogProps {
  applicantName: string;
  isOpen: boolean;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ArchiveApplicantDialog({
  applicantName,
  isOpen,
  isPending,
  onConfirm,
  onCancel,
}: ArchiveApplicantDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-dialog-title"
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
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(2px)',
        }}
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
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
        {/* Close button */}
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

        {/* Icon */}
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: '#FFF7ED',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
          }}
        >
          <AlertTriangle size={22} style={{ color: '#EA580C' }} />
        </div>

        {/* Content */}
        <h2
          id="archive-dialog-title"
          style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}
        >
          Archive Applicant
        </h2>
        <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '6px' }}>
          You are about to archive <strong style={{ color: '#0F172A' }}>{applicantName}</strong>.
        </p>
        <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', marginBottom: '24px' }}>
          Archived applicants are hidden from the active list. This action can be reversed by an
          administrator.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={isPending}>
            Archive
          </Button>
        </div>
      </div>
    </div>
  );
}
