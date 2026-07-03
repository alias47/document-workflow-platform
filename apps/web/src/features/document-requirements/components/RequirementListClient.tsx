'use client';

import { useState } from 'react';

import { CreateRequirementDialog } from './CreateRequirementDialog';
import { DeleteRequirementDialog } from './DeleteRequirementDialog';
import { EditRequirementDialog } from './EditRequirementDialog';
import { useArchiveRequirement, useDocumentRequirements } from '../hooks/use-document-requirements';

import type { DocumentRequirement } from '@/services/document-requirement.service';

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

export function RequirementListClient() {
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<DocumentRequirement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DocumentRequirement | null>(null);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');

  const archiveMutation = useArchiveRequirement();

  const isActive =
    filterActive === 'active' ? true : filterActive === 'inactive' ? false : undefined;

  const { data, isLoading, isError, refetch } = useDocumentRequirements({
    pageSize: 100,
    ...(search ? { search } : {}),
    ...(isActive !== undefined ? { isActive } : {}),
  });

  function handleArchiveConfirm() {
    if (!deleteTarget) return;
    archiveMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast({
          type: 'success',
          title: 'Requirement archived',
          message: `"${deleteTarget.name}" has been archived.`,
        });
        setDeleteTarget(null);
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Could not archive requirement.';
        toast({ type: 'error', title: 'Archive failed', message: msg });
      },
    });
  }

  if (isLoading) return <RequirementListSkeleton />;

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

  const requirements = data?.data ?? [];

  return (
    <>
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search requirements…"
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #D1D5DB',
            fontSize: '14px',
            color: '#0F172A',
            background: '#fff',
          }}
        />
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value as typeof filterActive)}
          style={{
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
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreate(true)}
        >
          + New Requirement
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
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>No requirements yet</p>
          <p style={{ fontSize: '13px', color: '#94A3B8' }}>
            Create document requirements that will be assigned to every new applicant.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreate(true)}
          >
            Create first requirement
          </button>
        </div>
      )}

      {/* Table */}
      {requirements.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Category
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Required
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Applicants
                </th>
                <th style={{ width: '80px' }} />
              </tr>
            </thead>
            <tbody>
              {requirements.map((req) => (
                <tr key={req.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 500, color: '#0F172A' }}>{req.name}</div>
                    {req.description && (
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                        {req.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', color: '#374151' }}>
                    {CATEGORY_LABELS[req.category] ?? req.category}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {req.isRequired ? (
                      <span style={{ color: '#DC2626', fontSize: '12px', fontWeight: 600 }}>
                        Required
                      </span>
                    ) : (
                      <span style={{ color: '#64748B', fontSize: '12px' }}>Optional</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {req.isActive ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: '#D1FAE5',
                          color: '#065F46',
                        }}
                      >
                        Active
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: '#F1F5F9',
                          color: '#64748B',
                        }}
                      >
                        Inactive
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', color: '#374151' }}>
                    {req._count.applicantRequirements}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        title="Edit"
                        onClick={() => setEditTarget(req)}
                        aria-label={`Edit ${req.name}`}
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        title="Archive"
                        onClick={() => setDeleteTarget(req)}
                        aria-label={`Archive ${req.name}`}
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
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialogs */}
      <CreateRequirementDialog isOpen={showCreate} onClose={() => setShowCreate(false)} />
      <EditRequirementDialog
        requirement={editTarget}
        isOpen={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
      />
      <DeleteRequirementDialog
        requirementName={deleteTarget?.name ?? ''}
        isOpen={Boolean(deleteTarget)}
        isPending={archiveMutation.isPending}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

function RequirementListSkeleton() {
  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-36" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
