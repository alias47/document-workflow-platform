'use client';

import { useEffect, useState } from 'react';

import { useUpdateRequirement } from '../hooks/use-document-requirements';

import type {
  DocumentCategory,
  DocumentRequirement,
} from '@/services/document-requirement.service';

import { useToast } from '@/components/ui/toast';

const CATEGORY_OPTIONS: { value: DocumentCategory; label: string }[] = [
  { value: 'identity', label: 'Identity' },
  { value: 'academic', label: 'Academic' },
  { value: 'financial', label: 'Financial' },
  { value: 'language', label: 'Language' },
  { value: 'reference', label: 'Reference' },
  { value: 'visa', label: 'Visa' },
  { value: 'other', label: 'Other' },
];

interface Props {
  requirement: DocumentRequirement | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditRequirementDialog({ requirement, isOpen, onClose }: Props) {
  const { toast } = useToast();
  const updateMutation = useUpdateRequirement();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('other');
  const [isRequired, setIsRequired] = useState(true);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (requirement) {
      setName(requirement.name);
      setDescription(requirement.description ?? '');
      setCategory(requirement.category);
      setIsRequired(requirement.isRequired);
      setIsActive(requirement.isActive);
    }
  }, [requirement]);

  function handleClose() {
    if (updateMutation.isPending) return;
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!requirement || !name.trim()) return;

    updateMutation.mutate(
      {
        id: requirement.id,
        data: {
          name: name.trim(),
          category,
          isRequired,
          isActive,
          ...(description.trim() ? { description: description.trim() } : {}),
        },
      },
      {
        onSuccess: () => {
          toast({ type: 'success', title: 'Requirement updated' });
          onClose();
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Could not update requirement.';
          toast({ type: 'error', title: 'Update failed', message: msg });
        },
      },
    );
  }

  if (!isOpen || !requirement) return null;

  const isPending = updateMutation.isPending;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-req-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <h2 id="edit-req-title" style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
            Edit Requirement
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
              padding: '4px',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="edit-req-name"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '6px',
              }}
            >
              Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              id="edit-req-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                color: '#0F172A',
                background: '#fff',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="edit-req-category"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '6px',
              }}
            >
              Category <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select
              id="edit-req-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              disabled={isPending}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                color: '#0F172A',
                background: '#fff',
                cursor: 'pointer',
                appearance: 'auto',
              }}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="edit-req-description"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '6px',
              }}
            >
              Description
            </label>
            <textarea
              id="edit-req-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isPending}
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                color: '#0F172A',
                background: '#fff',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              id="edit-req-required"
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              disabled={isPending}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label
              htmlFor="edit-req-required"
              style={{ fontSize: '13px', fontWeight: 500, color: '#374151', cursor: 'pointer' }}
            >
              Required document
            </label>
          </div>

          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              id="edit-req-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={isPending}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label
              htmlFor="edit-req-active"
              style={{ fontSize: '13px', fontWeight: 500, color: '#374151', cursor: 'pointer' }}
            >
              Active (assigned to new applicants)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isPending || !name.trim()}
            >
              {isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
