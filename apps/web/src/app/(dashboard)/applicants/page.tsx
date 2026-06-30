'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

import { useToast } from '@/components/ui/toast';

const STUDENTS = [
  {
    id: '1',
    initials: 'AK',
    color: 'blue',
    name: 'Arjun Kumar',
    stuId: 'STU-001',
    email: 'arjun.kumar@gmail.com',
    phone: '+44 7700 900123',
    destination: '🇬🇧 UK',
    badgeClass: 'badge-warning',
    status: 'Under Review',
    docsWidth: '60%',
    docsBarClass: 'progress-bar--warning',
    docs: '3/5',
    counselorColor: 'green',
    counselorInitials: 'SM',
    counselor: 'Sarah M.',
    added: '2 Jun 2026',
  },
  {
    id: '2',
    initials: 'PS',
    color: 'violet',
    name: 'Priya Sharma',
    stuId: 'STU-002',
    email: 'priya.sharma@gmail.com',
    phone: '+1 604 555 0189',
    destination: '🇨🇦 Canada',
    badgeClass: 'badge-success',
    status: 'Completed',
    docsWidth: '100%',
    docsBarClass: 'progress-bar--success',
    docs: '5/5',
    counselorColor: 'green',
    counselorInitials: 'SM',
    counselor: 'Sarah M.',
    added: '31 May 2026',
  },
  {
    id: '3',
    initials: 'MA',
    color: 'teal',
    name: 'Mohammed Al-Lami',
    stuId: 'STU-003',
    email: 'm.allami@gmail.com',
    phone: '+61 412 345 678',
    destination: '🇦🇺 Australia',
    badgeClass: 'badge-neutral',
    status: 'New',
    docsWidth: '0%',
    docsBarClass: '',
    docs: '0/6',
    counselorColor: 'violet',
    counselorInitials: 'JR',
    counselor: 'James R.',
    added: '29 May 2026',
  },
  {
    id: '4',
    initials: 'FN',
    color: 'amber',
    name: 'Fatima Nasser',
    stuId: 'STU-004',
    email: 'fnasser@gmail.com',
    phone: '+49 151 2345 6789',
    destination: '🇩🇪 Germany',
    badgeClass: 'badge-danger',
    status: 'Rejected',
    docsWidth: '40%',
    docsBarClass: 'progress-bar--danger',
    docs: '2/5',
    counselorColor: 'green',
    counselorInitials: 'SM',
    counselor: 'Sarah M.',
    added: '28 May 2026',
  },
  {
    id: '5',
    initials: 'LC',
    color: 'green',
    name: 'Li Chen',
    stuId: 'STU-005',
    email: 'li.chen@gmail.com',
    phone: '+1 212 555 0192',
    destination: '🇺🇸 USA',
    badgeClass: 'badge-brand',
    status: 'Pending Docs',
    docsWidth: '66%',
    docsBarClass: '',
    docs: '4/6',
    counselorColor: 'violet',
    counselorInitials: 'JR',
    counselor: 'James R.',
    added: '27 May 2026',
  },
] as const;

type Student = (typeof STUDENTS)[number];

export default function ApplicantsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [destFilter, setDestFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const filtered = STUDENTS.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    const matchStatus =
      !statusFilter || s.status.toLowerCase().includes(statusFilter.toLowerCase());
    const matchDest = !destFilter || s.destination.includes(destFilter);
    return matchSearch && matchStatus && matchDest;
  });

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((s) => s.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allChecked = filtered.length > 0 && selected.size === filtered.length;
  const someChecked = selected.size > 0 && selected.size < filtered.length;
  if (selectAllRef.current) {
    selectAllRef.current.indeterminate = someChecked;
  }

  function renderRow(s: Student) {
    return (
      <tr
        key={s.id}
        className="table-row-link"
        style={{ background: selected.has(s.id) ? '#EFF6FF' : undefined }}
      >
        <td
          onClick={(e) => {
            e.stopPropagation();
            toggleOne(s.id);
          }}
        >
          <input
            type="checkbox"
            checked={selected.has(s.id)}
            onChange={() => toggleOne(s.id)}
            style={{ cursor: 'pointer' }}
          />
        </td>
        <td>
          <Link
            href={`/applicants/${s.id}`}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
          >
            <div className="avatar avatar-sm" data-color={s.color}>
              {s.initials}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#0F172A' }}>{s.name}</div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: '#94A3B8' }}>{s.stuId}</div>
            </div>
          </Link>
        </td>
        <td>
          <div style={{ fontSize: 'var(--font-size-sm)' }}>{s.email}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: '#94A3B8' }}>{s.phone}</div>
        </td>
        <td>{s.destination}</td>
        <td>
          <span className={`badge ${s.badgeClass}`}>
            <span className={`badge-dot ${s.badgeClass}`} />
            {s.status}
          </span>
        </td>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="progress" style={{ width: '72px' }}>
              <div className={`progress-bar ${s.docsBarClass}`} style={{ width: s.docsWidth }} />
            </div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: '#64748B' }}>{s.docs}</span>
          </div>
        </td>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div className="avatar avatar-sm" data-color={s.counselorColor}>
              {s.counselorInitials}
            </div>
            <span style={{ fontSize: 'var(--font-size-sm)' }}>{s.counselor}</span>
          </div>
        </td>
        <td style={{ color: '#64748B', fontSize: 'var(--font-size-sm)' }}>{s.added}</td>
        <td onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === s.id ? null : s.id);
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
          {openMenu === s.id && (
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
                href={`/applicants/${s.id}`}
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
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                View Profile
              </Link>
              <button
                type="button"
                onClick={() => {
                  toast({
                    type: 'info',
                    title: 'Invitation resent!',
                    message: `Resent invite to ${s.name}.`,
                  });
                  setOpenMenu(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: 'var(--font-size-sm)',
                  color: '#0F172A',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
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
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Resend Invitation
              </button>
              <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />
              <button
                type="button"
                onClick={() => {
                  toast({
                    type: 'warning',
                    title: 'Archived',
                    message: `${s.name} has been archived.`,
                  });
                  setOpenMenu(null);
                }}
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
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="21 8 21 21 3 21 3 8" />
                  <rect x="1" y="3" width="22" height="5" />
                </svg>
                Archive
              </button>
            </div>
          )}
        </td>
      </tr>
    );
  }

  return (
    <div className="page" onClick={() => setOpenMenu(null)}>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Students</h2>
          <p className="page-subtitle">{STUDENTS.length} students across all stages</p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              toast({ type: 'info', title: 'Exporting…', message: 'Exporting student list.' })
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
              toast({
                type: 'info',
                title: 'Coming soon',
                message: 'Add student flow will be wired to the API.',
              })
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
            Add Student
          </button>
        </div>
      </div>

      {/* Filters bar */}
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
          <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '340px' }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
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
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="pending">Pending Documents</option>
            <option value="review">Under Review</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={destFilter}
            onChange={(e) => setDestFilter(e.target.value)}
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
            <option value="">All Destinations</option>
            <option value="UK">🇬🇧 UK</option>
            <option value="Canada">🇨🇦 Canada</option>
            <option value="Australia">🇦🇺 Australia</option>
            <option value="USA">🇺🇸 USA</option>
            <option value="Germany">🇩🇪 Germany</option>
          </select>

          <div
            style={{
              marginLeft: 'auto',
              fontSize: 'var(--font-size-sm)',
              color: '#64748B',
              whiteSpace: 'nowrap',
            }}
          >
            Showing <strong>{filtered.length}</strong> students
          </div>
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
            onClick={() => {
              toast({
                type: 'warning',
                title: 'Archived',
                message: `${selected.size} students archived.`,
              });
              setSelected(new Set());
            }}
          >
            Archive
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              toast({
                type: 'info',
                title: 'Exporting…',
                message: `Exporting ${selected.size} students.`,
              });
              setSelected(new Set());
            }}
          >
            Export
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

      {/* Students table */}
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th>Student</th>
                <th>Contact</th>
                <th>Destination</th>
                <th>Stage</th>
                <th>Progress</th>
                <th>Counselor</th>
                <th>Added</th>
                <th></th>
              </tr>
            </thead>
            <tbody>{filtered.map(renderRow)}</tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="card-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: 'var(--font-size-sm)', color: '#64748B' }}>
            Showing 1–{filtered.length} of {STUDENTS.length} students
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <button type="button" className="btn btn-ghost btn-sm" disabled>
              ← Prev
            </button>
            <button type="button" className="btn btn-primary btn-sm" style={{ minWidth: '34px' }}>
              1
            </button>
            <button type="button" className="btn btn-ghost btn-sm" style={{ minWidth: '34px' }}>
              2
            </button>
            <button type="button" className="btn btn-ghost btn-sm" style={{ minWidth: '34px' }}>
              3
            </button>
            <span style={{ fontSize: 'var(--font-size-sm)', color: '#94A3B8', padding: '0 4px' }}>
              …
            </span>
            <button type="button" className="btn btn-ghost btn-sm" style={{ minWidth: '34px' }}>
              13
            </button>
            <button type="button" className="btn btn-ghost btn-sm">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
