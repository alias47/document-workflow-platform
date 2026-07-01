'use client';

import { useState } from 'react';

import { DeleteDocumentDialog } from './DeleteDocumentDialog';
import { DocumentStatusBadge } from './DocumentStatusBadge';
import { UploadDocumentDialog } from './UploadDocumentDialog';
import { useDeleteDocument, useDocuments, useDownloadDocument } from '../hooks/use-documents';

import type { Document } from '@/services/document.service';

import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

const CATEGORY_LABELS: Record<string, string> = {
  identity: 'Identity',
  academic: 'Academic',
  financial: 'Financial',
  language: 'Language',
  reference: 'Reference',
  visa: 'Visa',
  other: 'Other',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getFileIcon(mimeType: string): string {
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.startsWith('image/')) return '🖼';
  if (mimeType.includes('word')) return '📝';
  return '📋';
}

interface Props {
  applicantId: string;
}

export function ApplicantDocuments({ applicantId }: Props) {
  const { toast } = useToast();
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);

  const { data, isLoading, isError, refetch } = useDocuments({ applicantId });
  const downloadMutation = useDownloadDocument();
  const deleteMutation = useDeleteDocument();

  function handleDownload(doc: Document) {
    downloadMutation.mutate(
      { id: doc.id, filename: doc.originalFilename },
      {
        onError: () => {
          toast({ type: 'error', title: 'Download failed', message: 'Could not download file.' });
        },
      },
    );
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deleteMutation.mutate(
      { id: deleteTarget.id, applicantId },
      {
        onSuccess: () => {
          toast({ type: 'success', title: 'File deleted', message: 'The file has been removed.' });
          setDeleteTarget(null);
        },
        onError: () => {
          toast({
            type: 'error',
            title: 'Delete failed',
            message: 'Could not delete the file. Please try again.',
          });
        },
      },
    );
  }

  if (isLoading) {
    return <DocumentListSkeleton />;
  }

  if (isError) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: '#FEF2F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#DC2626',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
          Failed to load documents
        </p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => void refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const documents = data?.data ?? [];

  return (
    <>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <p style={{ fontSize: '14px', color: '#64748B' }}>
          {documents.length === 0
            ? 'No documents yet'
            : `${documents.length} document${documents.length !== 1 ? 's' : ''}`}
        </p>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setShowUpload(true)}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ marginRight: '6px' }}
          >
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
          Upload Document
        </button>
      </div>

      {/* Empty state */}
      {documents.length === 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            border: '2px dashed #E2E8F0',
            borderRadius: '10px',
            background: '#F8FAFC',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B', marginBottom: '4px' }}>
              No documents uploaded
            </p>
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>
              Upload the applicant&apos;s documents to get started.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowUpload(true)}
          >
            Upload first document
          </button>
        </div>
      )}

      {/* Document list */}
      {documents.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              isDownloading={
                downloadMutation.isPending && downloadMutation.variables?.id === doc.id
              }
              onDownload={() => handleDownload(doc)}
              onDelete={() => setDeleteTarget(doc)}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <UploadDocumentDialog
        applicantId={applicantId}
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
      />
      <DeleteDocumentDialog
        filename={deleteTarget?.originalFilename ?? ''}
        isOpen={Boolean(deleteTarget)}
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

interface DocumentCardProps {
  doc: Document;
  isDownloading: boolean;
  onDownload: () => void;
  onDelete: () => void;
}

function DocumentCard({ doc, isDownloading, onDownload, onDelete }: DocumentCardProps) {
  const isArchived = doc.status === 'archived';

  return (
    <div className="doc-card" style={isArchived ? { opacity: 0.6 } : undefined}>
      {/* File icon */}
      <div
        className="doc-card__icon"
        style={{
          background:
            doc.status === 'verified'
              ? 'var(--color-success-50, #F0FDF4)'
              : doc.status === 'pending'
                ? 'var(--color-warning-50, #FFFBEB)'
                : '#F1F5F9',
          fontSize: '18px',
        }}
      >
        {getFileIcon(doc.mimeType)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="doc-card__name">{doc.originalFilename}</div>
        <div className="doc-card__meta">
          {doc.mimeType.split('/')[1]?.toUpperCase() ?? doc.mimeType}
          {' · '}
          {formatFileSize(doc.fileSize)}
          {' · '}
          {CATEGORY_LABELS[doc.category] ?? doc.category}
          {' · '}
          {formatDate(doc.createdAt)}
          {doc.uploadedByStaff && (
            <>
              {' '}
              · by {doc.uploadedByStaff.firstName} {doc.uploadedByStaff.lastName}
            </>
          )}
        </div>
      </div>

      {/* Status badge */}
      <DocumentStatusBadge status={doc.status} />

      {/* Actions */}
      <div className="doc-card__actions">
        {!isArchived && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            title="Download"
            disabled={isDownloading}
            onClick={onDownload}
            aria-label={`Download ${doc.originalFilename}`}
          >
            {isDownloading ? (
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
                ⏳
              </span>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
          </button>
        )}
        {!isArchived && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            title="Delete file"
            onClick={onDelete}
            aria-label={`Delete file for ${doc.originalFilename}`}
            style={{ color: '#EF4444' }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function DocumentListSkeleton() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-36" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="doc-card">
            <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
            <div style={{ flex: 1 }}>
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
