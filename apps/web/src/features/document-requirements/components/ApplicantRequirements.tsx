'use client';

import { useState } from 'react';

import { RequirementStatusBadge } from './RequirementStatusBadge';
import {
  useApplicantDocumentRequirements,
  useSyncApplicantRequirements,
  useUpdateApplicantRequirementStatus,
} from '../hooks/use-document-requirements';

import type {
  ApplicantDocumentRequirement,
  RequirementStatus,
} from '@/services/document-requirement.service';

import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

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

const STATUS_TRANSITIONS: Record<RequirementStatus, { label: string; next: RequirementStatus }[]> =
  {
    pending: [],
    uploaded: [
      { label: 'Approve', next: 'approved' },
      { label: 'Reject', next: 'rejected' },
    ],
    approved: [{ label: 'Revert to Pending', next: 'pending' }],
    rejected: [
      { label: 'Approve', next: 'approved' },
      { label: 'Reset to Pending', next: 'pending' },
    ],
  };

interface Props {
  applicantId: string;
}

export function ApplicantRequirements({ applicantId }: Props) {
  const { toast } = useToast();
  const { data, isLoading, isError, refetch } = useApplicantDocumentRequirements(applicantId);
  const syncMutation = useSyncApplicantRequirements();
  const statusMutation = useUpdateApplicantRequirementStatus();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleSync() {
    syncMutation.mutate(applicantId, {
      onSuccess: () => {
        toast({
          type: 'success',
          title: 'Requirements synced',
          message: 'New active requirements have been added.',
        });
      },
      onError: () => {
        toast({ type: 'error', title: 'Sync failed', message: 'Could not sync requirements.' });
      },
    });
  }

  function handleStatusChange(adrId: string, status: RequirementStatus) {
    statusMutation.mutate(
      { id: adrId, status, applicantId },
      {
        onSuccess: () => {
          toast({ type: 'success', title: 'Status updated' });
        },
        onError: () => {
          toast({ type: 'error', title: 'Update failed', message: 'Could not update status.' });
        },
      },
    );
  }

  if (isLoading) return <ApplicantRequirementsSkeleton />;

  if (isError) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
          Failed to load requirements
        </p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => void refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const requirements: ApplicantDocumentRequirement[] = data?.data ?? [];
  const pendingCount = requirements.filter((r) => r.status === 'pending').length;
  const approvedCount = requirements.filter((r) => r.status === 'approved').length;

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
          {requirements.length === 0
            ? 'No requirements assigned'
            : `${approvedCount}/${requirements.length} completed${pendingCount > 0 ? ` · ${pendingCount} pending` : ''}`}
        </p>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleSync}
          disabled={syncMutation.isPending}
          title="Sync any new active requirements"
        >
          {syncMutation.isPending ? 'Syncing…' : 'Sync Requirements'}
        </button>
      </div>

      {/* Empty state */}
      {requirements.length === 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            border: '2px dashed #E2E8F0',
            borderRadius: '10px',
            background: '#F8FAFC',
          }}
        >
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>
            No document requirements
          </p>
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>
            No requirements have been assigned to this applicant yet.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleSync}
            disabled={syncMutation.isPending}
          >
            Sync from active requirements
          </button>
        </div>
      )}

      {/* Requirement rows */}
      {requirements.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {requirements.map((adr) => {
            const isExpanded = expandedId === adr.id;
            const transitions = STATUS_TRANSITIONS[adr.status] ?? [];

            return (
              <div
                key={adr.id}
                style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}
              >
                {/* Row header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : adr.id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ')
                      setExpandedId(isExpanded ? null : adr.id);
                  }}
                >
                  {/* Expand chevron */}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{
                      flexShrink: 0,
                      color: '#94A3B8',
                      transform: isExpanded ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.15s',
                    }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, color: '#0F172A', fontSize: '14px' }}>
                      {adr.requirement.name}
                      {adr.requirement.isRequired && (
                        <span
                          style={{
                            marginLeft: '6px',
                            fontSize: '11px',
                            color: '#DC2626',
                            fontWeight: 600,
                          }}
                        >
                          Required
                        </span>
                      )}
                    </div>
                    {adr.requirement.description && (
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                        {adr.requirement.description}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                      {adr.documents.length} file{adr.documents.length !== 1 ? 's' : ''}
                    </span>
                    <RequirementStatusBadge status={adr.status} />
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderTop: '1px solid #F1F5F9',
                      background: '#F8FAFC',
                    }}
                  >
                    {/* Uploaded files */}
                    {adr.documents.length > 0 ? (
                      <div style={{ marginBottom: '12px' }}>
                        <p
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#64748B',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          Uploaded Files
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {adr.documents.map((doc) => (
                            <div
                              key={doc.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 10px',
                                background: '#fff',
                                borderRadius: '8px',
                                border: '1px solid #E2E8F0',
                              }}
                            >
                              <span style={{ fontSize: '16px' }}>📄</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p
                                  style={{
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: '#1E293B',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {doc.originalFilename}
                                </p>
                                <p style={{ fontSize: '11px', color: '#94A3B8' }}>
                                  {formatFileSize(doc.fileSize)} · {formatDate(doc.createdAt)}
                                  {doc.uploadedByStaff &&
                                    ` · by ${doc.uploadedByStaff.firstName} ${doc.uploadedByStaff.lastName}`}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '12px' }}>
                        No files uploaded for this requirement yet.
                      </p>
                    )}

                    {/* Status actions */}
                    {transitions.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {transitions.map((t) => (
                          <button
                            key={t.next}
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleStatusChange(adr.id, t.next)}
                            disabled={statusMutation.isPending}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function ApplicantRequirementsSkeleton() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-36" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
