'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useRef, useState, useTransition } from 'react';

import { useApplicants, useArchiveApplicant } from '../hooks/use-applicants';

import type { ApplicantStatus } from '@/services/applicant.service';

import { EmptyState } from '@/components/ui/empty-state';
import { Pagination } from '@/components/ui/pagination';
import { Skeleton, SkeletonTableRow } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/cn';

const STATUS_OPTIONS: { label: string; value: ApplicantStatus | '' }[] = [
  { label: 'All Statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Archived', value: 'archived' },
];

const SORT_OPTIONS = [
  { label: 'Newest first', value: 'createdAt:desc' },
  { label: 'Oldest first', value: 'createdAt:asc' },
  { label: 'Name A–Z', value: 'lastName:asc' },
  { label: 'Name Z–A', value: 'lastName:desc' },
  { label: 'Applicant #', value: 'applicantNumber:asc' },
] as const;

const PAGE_SIZE = 25;

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

const AVATAR_COLORS = ['blue', 'violet', 'teal', 'amber', 'green', 'rose'] as const;
function avatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export function ApplicantListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // --- URL-driven state ---
  const page = Number(searchParams.get('page') ?? '1');
  const search = searchParams.get('search') ?? '';
  const status = (searchParams.get('status') ?? '') as ApplicantStatus | '';
  const sort = searchParams.get('sort') ?? 'createdAt:desc';

  const [sortBy, sortOrder] = sort.split(':') as [string, 'asc' | 'desc'];

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    // Reset to page 1 when filters/search/sort changes
    if (!('page' in updates)) params.set('page', '1');
    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  }

  // --- Data ---
  const { data, isLoading, isError, error } = useApplicants({
    page,
    pageSize: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    sortBy: sortBy as 'createdAt' | 'lastName' | 'firstName' | 'applicantNumber' | 'status',
    sortOrder,
  });

  const archiveMutation = useArchiveApplicant();

  const applicants = data?.data ?? [];
  const meta = data?.meta;
  const totalItems = meta?.totalItems ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  // --- Selection ---
  const allSelected = applicants.length > 0 && applicants.every((a) => selected.has(a.id));
  const someSelected = applicants.some((a) => selected.has(a.id)) && !allSelected;
  if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected;

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(applicants.map((a) => a.id)));
  }, [allSelected, applicants]);

  // --- Archive ---
  function handleArchive(id: string, name: string) {
    archiveMutation.mutate(id, {
      onSuccess: () => {
        toast({ type: 'success', title: 'Archived', message: `${name} has been archived.` });
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setOpenMenu(null);
      },
      onError: () => {
        toast({ type: 'error', title: 'Error', message: 'Failed to archive applicant.' });
      },
    });
  }

  function handleBulkArchive() {
    const ids = [...selected];
    let done = 0;
    ids.forEach((id) => {
      archiveMutation.mutate(id, {
        onSettled: () => {
          done++;
          if (done === ids.length) {
            toast({
              type: 'success',
              title: 'Archived',
              message: `${ids.length} applicant(s) archived.`,
            });
            setSelected(new Set());
          }
        },
      });
    });
  }

  // --- Render ---
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-[#FFE4E6] flex items-center justify-center text-[#DC2626]">
          <svg
            width="22"
            height="22"
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
        <div>
          <p className="font-semibold text-[#0F172A]">Failed to load applicants</p>
          <p className="text-sm text-[#64748B] mt-1">
            {(error as Error)?.message ?? 'An unexpected error occurred.'}
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => router.refresh()}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="page" onClick={() => setOpenMenu(null)}>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Applicants</h2>
          {isLoading ? (
            <Skeleton className="h-4 w-36 mt-1" />
          ) : (
            <p className="page-subtitle">
              {totalItems} applicant{totalItems !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-secondary">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              toast({ type: 'info', title: 'Coming soon', message: 'Create applicant flow.' })
            }
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Applicant
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ marginBottom: 'var(--space-5)', padding: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '340px' }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search by name, ID or email…"
              value={search}
              onChange={(e) => updateParams({ search: e.target.value })}
              style={{
                width: '100%',
                height: '42px',
                paddingLeft: '40px',
                paddingRight: '12px',
                border: '1.5px solid #E2E8F0',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-base)',
                fontFamily: 'inherit',
                outline: 'none',
                background: '#FFFFFF',
              }}
            />
          </div>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => updateParams({ status: e.target.value })}
            style={{
              height: '42px',
              padding: '0 36px 0 12px',
              border: '1.5px solid #E2E8F0',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-base)',
              fontFamily: 'inherit',
              outline: 'none',
              background: '#FFFFFF',
              minWidth: '160px',
              appearance: 'none',
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            style={{
              height: '42px',
              padding: '0 36px 0 12px',
              border: '1.5px solid #E2E8F0',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-base)',
              fontFamily: 'inherit',
              outline: 'none',
              background: '#FFFFFF',
              minWidth: '160px',
              appearance: 'none',
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {!isLoading && (
            <div
              style={{
                marginLeft: 'auto',
                fontSize: 'var(--font-size-sm)',
                color: '#64748B',
                whiteSpace: 'nowrap',
              }}
            >
              {totalItems} result{totalItems !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: '#1D4ED8' }}>
            {selected.size} selected
          </span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleBulkArchive}
            disabled={archiveMutation.isPending}
          >
            Archive
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: 'auto' }}
            onClick={() => setSelected(new Set())}
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    disabled={isLoading}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th>Applicant</th>
                <th>Contact</th>
                <th>Nationality</th>
                <th>Status</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonTableRow key={i} cols={7} />)
              ) : applicants.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 0 }}>
                    <EmptyState
                      title={
                        search || status ? 'No applicants match your filters' : 'No applicants yet'
                      }
                      description={
                        search || status
                          ? 'Try adjusting your search or filters.'
                          : 'Add your first applicant to get started.'
                      }
                      action={
                        search || status ? (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => updateParams({ search: '', status: '' })}
                          >
                            Clear filters
                          </button>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              ) : (
                applicants.map((applicant, index) => {
                  const fullName = `${applicant.firstName} ${applicant.lastName}`;
                  const initials = getInitials(applicant.firstName, applicant.lastName);
                  const color = avatarColor(index);
                  const isMenuOpen = openMenu === applicant.id;

                  return (
                    <tr
                      key={applicant.id}
                      className="table-row-link"
                      style={{ background: selected.has(applicant.id) ? '#EFF6FF' : undefined }}
                    >
                      <td
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleOne(applicant.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(applicant.id)}
                          onChange={() => toggleOne(applicant.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>

                      <td>
                        <Link
                          href={`/applicants/${applicant.id}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            textDecoration: 'none',
                          }}
                        >
                          <div className="avatar avatar-sm" data-color={color}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0F172A' }}>{fullName}</div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: '#94A3B8' }}>
                              {applicant.applicantNumber}
                            </div>
                          </div>
                        </Link>
                      </td>

                      <td>
                        {applicant.email && (
                          <div style={{ fontSize: 'var(--font-size-sm)' }}>{applicant.email}</div>
                        )}
                        {applicant.phone && (
                          <div style={{ fontSize: 'var(--font-size-xs)', color: '#94A3B8' }}>
                            {applicant.phone}
                          </div>
                        )}
                      </td>

                      <td style={{ fontSize: 'var(--font-size-sm)', color: '#475569' }}>
                        {applicant.nationality ?? applicant.country ?? '—'}
                      </td>

                      <td>
                        <span
                          className={cn(
                            'badge',
                            applicant.status === 'active'
                              ? 'badge-success'
                              : applicant.status === 'inactive'
                                ? 'badge-warning'
                                : 'badge-neutral',
                          )}
                        >
                          <span
                            className={cn(
                              'badge-dot',
                              applicant.status === 'active'
                                ? 'badge-success'
                                : applicant.status === 'inactive'
                                  ? 'badge-warning'
                                  : 'badge-neutral',
                            )}
                          />
                          {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                        </span>
                      </td>

                      <td style={{ color: '#64748B', fontSize: 'var(--font-size-sm)' }}>
                        {new Date(applicant.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          aria-label="Actions"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(isMenuOpen ? null : applicant.id);
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="19" r="1" />
                          </svg>
                        </button>

                        {isMenuOpen && (
                          <div
                            style={{
                              position: 'absolute',
                              right: 0,
                              top: '100%',
                              zIndex: 50,
                              background: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              borderRadius: 'var(--radius-md)',
                              boxShadow: '0 10px 15px rgba(15,23,42,0.1)',
                              minWidth: '160px',
                              padding: '4px',
                            }}
                          >
                            <Link
                              href={`/applicants/${applicant.id}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                fontSize: 'var(--font-size-sm)',
                                color: '#0F172A',
                                textDecoration: 'none',
                              }}
                            >
                              View Profile
                            </Link>
                            <div
                              style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }}
                            />
                            <button
                              type="button"
                              disabled={archiveMutation.isPending}
                              onClick={() => handleArchive(applicant.id, fullName)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '8px 12px',
                                fontSize: 'var(--font-size-sm)',
                                color: '#DC2626',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                textAlign: 'left',
                              }}
                            >
                              Archive
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="card-footer">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={(p) => updateParams({ page: String(p) })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
