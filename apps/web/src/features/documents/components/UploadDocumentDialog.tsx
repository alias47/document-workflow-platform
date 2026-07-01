'use client';

import { useCallback, useRef, useState } from 'react';

import { useUploadDocument } from '../hooks/use-documents';

import type { DocumentCategory } from '@/services/document.service';

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

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.docx'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MiB

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `File type not supported. Allowed: PDF, JPEG, PNG, WEBP, DOCX.`;
  }
  const ext = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return `File extension not supported. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}.`;
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `File is too large. Maximum size is 10 MB.`;
  }
  return null;
}

interface Props {
  applicantId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function UploadDocumentDialog({ applicantId, isOpen, onClose }: Props) {
  const { toast } = useToast();
  const uploadMutation = useUploadDocument();

  const [category, setCategory] = useState<DocumentCategory>('identity');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setCategory('identity');
    setFile(null);
    setFileError(null);
    setIsDragging(false);
  }

  function handleClose() {
    if (uploadMutation.isPending) return;
    reset();
    onClose();
  }

  function acceptFile(f: File) {
    const err = validateFile(f);
    if (err) {
      setFileError(err);
      setFile(null);
    } else {
      setFileError(null);
      setFile(f);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) acceptFile(f);
    // Reset input so same file can be re-selected after removal
    e.target.value = '';
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) acceptFile(f);
  }, []); // acceptFile is stable (defined at component scope); no external deps needed

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setFileError('Please select a file.');
      return;
    }
    uploadMutation.mutate(
      { applicantId, category, file },
      {
        onSuccess: () => {
          toast({
            type: 'success',
            title: 'Document uploaded',
            message: `${file.name} uploaded successfully.`,
          });
          reset();
          onClose();
        },
        onError: () => {
          toast({
            type: 'error',
            title: 'Upload failed',
            message: 'Could not upload the document. Please try again.',
          });
        },
      },
    );
  }

  if (!isOpen) return null;

  const isPending = uploadMutation.isPending;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-doc-title"
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
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog */}
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
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <h2 id="upload-doc-title" style={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
            Upload Document
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
          {/* Category selector */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="doc-category"
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
              id="doc-category"
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

          {/* Drop zone */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '6px',
              }}
            >
              File <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div
              role="button"
              tabIndex={0}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isPending && fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
              }}
              style={{
                border: `2px dashed ${isDragging ? '#2563EB' : fileError ? '#EF4444' : '#D1D5DB'}`,
                borderRadius: '10px',
                padding: '24px 16px',
                textAlign: 'center',
                cursor: isPending ? 'not-allowed' : 'pointer',
                background: isDragging ? '#EFF6FF' : '#F8FAFC',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              {file ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>📄</span>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#1E293B' }}>
                      {file.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748B' }}>
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  {!isPending && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setFileError(null);
                      }}
                      style={{
                        marginLeft: 'auto',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94A3B8',
                      }}
                      aria-label="Remove file"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: '#E0E7FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 10px',
                      color: '#2563EB',
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
                      <polyline points="16 16 12 12 8 16" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                    </svg>
                  </div>
                  <p style={{ fontSize: '14px', color: '#374151', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: '#2563EB' }}>Click to browse</span> or
                    drag & drop
                  </p>
                  <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                    PDF, JPEG, PNG, WEBP, DOCX — max 10 MB
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_EXTENSIONS.join(',')}
              onChange={handleFileInput}
              style={{ display: 'none' }}
              aria-hidden="true"
            />
            {fileError && (
              <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '6px' }}>{fileError}</p>
            )}
          </div>

          {/* Upload progress indicator */}
          {isPending && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                background: '#EFF6FF',
                borderRadius: '8px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #BFDBFE',
                  borderTopColor: '#2563EB',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  flexShrink: 0,
                }}
              />
              <p style={{ fontSize: '13px', color: '#2563EB' }}>Uploading…</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isPending || !file}>
              {isPending ? 'Uploading…' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
