'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';

import type { AssignedApplicant, Staff } from '../types/staff.types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface AssignApplicantsDialogProps {
  staff: Staff;
  currentApplicants: AssignedApplicant[];
  allApplicants: Array<{
    id: string;
    applicantNumber: string;
    firstName: string;
    lastName: string;
    email: string | null;
    status: string;
  }>;
  isOpen: boolean;
  isPending: boolean;
  onConfirm: (applicantIds: string[]) => void;
  onCancel: () => void;
}

export function AssignApplicantsDialog({
  staff,
  currentApplicants,
  allApplicants,
  isOpen,
  isPending,
  onConfirm,
  onCancel,
}: AssignApplicantsDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(currentApplicants.map((a) => a.id)),
  );
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = allApplicants.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.firstName.toLowerCase().includes(q) ||
      a.lastName.toLowerCase().includes(q) ||
      (a.email ?? '').toLowerCase().includes(q) ||
      a.applicantNumber.toLowerCase().includes(q)
    );
  });

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    onConfirm([...selected]);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-applicants-title"
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
          maxWidth: '600px',
          padding: '24px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          aria-label="Close"
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

        <div style={{ marginBottom: '16px' }}>
          <h2
            id="assign-applicants-title"
            style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}
          >
            Assign Applicants
          </h2>
          <p style={{ fontSize: '13px', color: '#64748B' }}>
            Manage applicants assigned to{' '}
            <strong>
              {staff.firstName} {staff.lastName}
            </strong>
            . Changes are applied atomically.
          </p>
        </div>

        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicants…"
            style={{
              width: '100%',
              height: '36px',
              paddingLeft: '32px',
              paddingRight: '12px',
              fontSize: '14px',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              outline: 'none',
              color: '#1E293B',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            {selected.size} of {allApplicants.length} selected
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setSelected(new Set(allApplicants.map((a) => a.id)))}
              style={{
                fontSize: '12px',
                color: '#2563EB',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              style={{
                fontSize: '12px',
                color: '#64748B',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Clear all
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            minHeight: 0,
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}
            >
              No applicants found
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {filtered.map((a, i) => {
                const isSelected = selected.has(a.id);
                return (
                  <li
                    key={a.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderBottom: i < filtered.length - 1 ? '1px solid #F1F5F9' : 'none',
                      cursor: 'pointer',
                      background: isSelected ? '#EFF6FF' : 'transparent',
                      transition: 'background 0.1s',
                    }}
                    onClick={() => toggle(a.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(a.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 accent-[#2563EB]"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B', margin: 0 }}>
                        {a.firstName} {a.lastName}
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                        {a.applicantNumber}
                        {a.email ? ` · ${a.email}` : ''}
                      </p>
                    </div>
                    <Badge
                      variant={
                        a.status === 'active'
                          ? 'success'
                          : a.status === 'archived'
                            ? 'secondary'
                            : 'warning'
                      }
                    >
                      {a.status}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div
          style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}
        >
          <Button variant="secondary" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} loading={isPending}>
            Save Assignments ({selected.size})
          </Button>
        </div>
      </div>
    </div>
  );
}
