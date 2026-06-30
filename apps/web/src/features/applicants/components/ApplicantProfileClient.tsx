'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useToast } from '@/components/ui/toast';

type Tab = 'documents' | 'timeline' | 'notes' | 'info';

const TABS: { id: Tab; label: string }[] = [
  { id: 'documents', label: 'Documents' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'notes', label: 'Notes' },
  { id: 'info', label: 'Info' },
];

const DOCS = [
  {
    id: '1',
    icon: '📄',
    iconBg: '#FFF1F2',
    name: 'Passport Copy',
    meta: 'PDF · 2.4 MB · Uploaded 2 Jun 2026',
    badgeClass: 'badge-success',
    status: '✓ Approved',
    type: 'approved' as const,
  },
  {
    id: '2',
    icon: '📝',
    iconBg: '#EFF6FF',
    name: 'Academic Transcript',
    meta: 'PDF · 1.8 MB · Uploaded 1 Jun 2026',
    badgeClass: 'badge-success',
    status: '✓ Approved',
    type: 'approved' as const,
  },
  {
    id: '3',
    icon: '📄',
    iconBg: '#FFFBEB',
    name: 'Bank Statement',
    meta: 'PDF · 980 KB · Uploaded today',
    badgeClass: 'badge-warning',
    status: '⏳ Under Review',
    type: 'review' as const,
  },
  {
    id: '4',
    icon: '📋',
    iconBg: '#F1F5F9',
    name: 'English Proficiency Certificate',
    meta: 'Awaiting upload from student',
    badgeClass: 'badge-neutral',
    status: 'Missing',
    type: 'missing' as const,
  },
  {
    id: '5',
    icon: '📋',
    iconBg: '#F1F5F9',
    name: 'Statement of Purpose',
    meta: 'Awaiting upload from student',
    badgeClass: 'badge-neutral',
    status: 'Missing',
    type: 'missing' as const,
  },
];

const TIMELINE = [
  {
    id: '1',
    dotBg: '#DCFCE7',
    dotColor: '#16A34A',
    title: 'Passport approved',
    meta: 'Sarah Mitchell · 2 Jun 2026, 10:14',
    body: null,
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    id: '2',
    dotBg: '#DBEAFE',
    dotColor: '#2563EB',
    title: 'Bank statement uploaded',
    meta: 'Arjun Kumar (portal) · 2 Jun 2026, 09:05',
    body: null,
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    id: '3',
    dotBg: '#DCFCE7',
    dotColor: '#16A34A',
    title: 'Academic Transcript approved',
    meta: 'Sarah Mitchell · 1 Jun 2026, 15:30',
    body: null,
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    id: '4',
    dotBg: '#DBEAFE',
    dotColor: '#2563EB',
    title: 'Passport copy uploaded',
    meta: 'Arjun Kumar (portal) · 2 Jun 2026, 08:44',
    body: null,
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    id: '5',
    dotBg: '#DBEAFE',
    dotColor: '#2563EB',
    title: 'Academic Transcript uploaded',
    meta: 'Arjun Kumar (portal) · 1 Jun 2026, 14:22',
    body: null,
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    id: '6',
    dotBg: '#F1F5F9',
    dotColor: '#64748B',
    title: 'Portal invitation sent',
    meta: 'System · 2 Jun 2026, 08:00',
    body: 'Invitation email sent to arjun.kumar@gmail.com with login credentials.',
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    id: '7',
    dotBg: '#F1F5F9',
    dotColor: '#64748B',
    title: 'Student profile created',
    meta: 'Sarah Mitchell · 2 Jun 2026, 08:00',
    body: null,
    icon: (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
  },
];

const NOTES = [
  {
    id: '1',
    avatarColor: 'green',
    avatarInitials: 'SM',
    author: 'Sarah Mitchell',
    date: '1 Jun 2026, 11:20',
    text: "Student confirmed they'll upload the IELTS certificate by end of week. Bank statement is from 3 months ago — may need to get a more recent one.",
  },
  {
    id: '2',
    avatarColor: 'violet',
    avatarInitials: 'JR',
    author: 'James Robinson',
    date: '2 Jun 2026, 09:30',
    text: "Called the student. He's aware of the missing documents and will upload them tonight.",
  },
];

interface Props {
  id: string;
}

export function ApplicantProfileClient({ id: _id }: Props) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('documents');
  const [note, setNote] = useState('');

  return (
    <div className="page">
      {/* Breadcrumb */}
      <div className="breadcrumbs" style={{ marginBottom: 'var(--space-4)' }}>
        <Link href="/applicants">Students</Link>
        <span>›</span>
        <span className="current">Arjun Kumar</span>
      </div>

      {/* Profile header */}
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card-body">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-4)',
              flexWrap: 'wrap',
            }}
          >
            <div className="avatar avatar-xl" data-color="blue">
              AK
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  flexWrap: 'wrap',
                }}
              >
                <h2
                  style={{
                    fontSize: 'var(--font-size-2xl)',
                    fontWeight: 800,
                    color: '#0F172A',
                    letterSpacing: '-0.4px',
                  }}
                >
                  Arjun Kumar
                </h2>
                <span className="badge badge-warning">
                  <span className="badge-dot badge-warning" />
                  Under Review
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--space-5)',
                  marginTop: 'var(--space-3)',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    fontSize: 'var(--font-size-sm)',
                    color: '#64748B',
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
                  arjun.kumar@gmail.com
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    fontSize: 'var(--font-size-sm)',
                    color: '#64748B',
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
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.93 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  +44 7700 900123
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    fontSize: 'var(--font-size-sm)',
                    color: '#64748B',
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
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Mumbai, India
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: '#64748B' }}>
                  Student ID: <strong>STU-001</strong>
                </div>
              </div>
            </div>

            {/* Header actions */}
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-2)',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  toast({
                    type: 'info',
                    title: 'Invitation resent!',
                    message: 'Invitation email sent to arjun.kumar@gmail.com.',
                  })
                }
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
                Resend Invite
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  toast({
                    type: 'info',
                    title: 'Coming soon',
                    message: 'Edit student form will be implemented.',
                  })
                }
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
                Edit
              </button>
            </div>
          </div>

          {/* Progress summary */}
          <div
            style={{
              marginTop: 'var(--space-5)',
              paddingTop: 'var(--space-4)',
              borderTop: '1px solid #F1F5F9',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-2)',
              }}
            >
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: '#334155' }}>
                Document Progress
              </span>
              <span style={{ fontSize: 'var(--font-size-sm)', color: '#64748B' }}>
                3 of 5 submitted
              </span>
            </div>
            <div className="progress" style={{ height: '8px' }}>
              <div className="progress-bar progress-bar--warning" style={{ width: '60%' }} />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: '#16A34A', fontWeight: 600 }}>
                ✓ 2 Approved
              </span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: '#D97706', fontWeight: 600 }}>
                ⏳ 1 Under Review
              </span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: '#64748B' }}>
                📋 2 Missing
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid-aside-wide">
        {/* Left: tabs */}
        <div>
          <div className="tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`tab${activeTab === t.id ? ' active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Documents tab */}
          {activeTab === 'documents' && (
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    toast({
                      type: 'info',
                      title: 'Coming soon',
                      message: 'Request document flow not yet wired.',
                    })
                  }
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Request Document
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {DOCS.map((doc) => (
                  <div
                    key={doc.id}
                    className="doc-card"
                    style={
                      doc.type === 'missing'
                        ? { borderStyle: 'dashed', background: '#F8FAFC' }
                        : doc.type === 'review'
                          ? { borderColor: '#FDE68A' }
                          : undefined
                    }
                  >
                    <div
                      className="doc-card__icon"
                      style={{
                        background: doc.iconBg,
                        color: doc.type === 'missing' ? '#94A3B8' : undefined,
                      }}
                    >
                      {doc.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="doc-card__name"
                        style={doc.type === 'missing' ? { color: '#475569' } : undefined}
                      >
                        {doc.name}
                      </div>
                      <div className="doc-card__meta">{doc.meta}</div>
                    </div>
                    <span className={`badge ${doc.badgeClass}`}>{doc.status}</span>
                    <div className="doc-card__actions">
                      {doc.type === 'approved' && (
                        <>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            title="Preview"
                            onClick={() =>
                              toast({ type: 'info', title: 'Opening preview…', message: doc.name })
                            }
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
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            title="Download"
                            onClick={() =>
                              toast({ type: 'info', title: 'Downloading…', message: doc.name })
                            }
                          >
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
                          </button>
                        </>
                      )}
                      {doc.type === 'review' && (
                        <>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() =>
                              toast({
                                type: 'success',
                                title: 'Document approved!',
                                message: `${doc.name} approved.`,
                              })
                            }
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger-ghost btn-sm"
                            onClick={() =>
                              toast({
                                type: 'error',
                                title: 'Document rejected',
                                message: `${doc.name} rejected.`,
                              })
                            }
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {doc.type === 'missing' && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() =>
                            toast({
                              type: 'info',
                              title: 'Reminder sent!',
                              message: `Reminded Arjun about ${doc.name}.`,
                            })
                          }
                        >
                          Send Reminder
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline tab */}
          {activeTab === 'timeline' && (
            <div className="timeline">
              {TIMELINE.map((event) => (
                <div key={event.id} className="timeline-item">
                  <div className="timeline-connector">
                    <div
                      className="timeline-dot"
                      style={{ background: event.dotBg, color: event.dotColor }}
                    >
                      {event.icon}
                    </div>
                    <div className="timeline-line" />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-content__title">{event.title}</div>
                    <div className="timeline-content__meta">{event.meta}</div>
                    {event.body && <div className="timeline-content__body">{event.body}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes tab */}
          {activeTab === 'notes' && (
            <div>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add an internal note about this student…"
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '12px',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--font-size-base)',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: 'var(--space-2)',
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      if (note.trim()) {
                        toast({
                          type: 'success',
                          title: 'Note added!',
                          message: 'Your note has been saved.',
                        });
                        setNote('');
                      }
                    }}
                  >
                    Add Note
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {NOTES.map((n) => (
                  <div key={n.id} className="card" style={{ boxShadow: 'none' }}>
                    <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: 'var(--space-2)',
                        }}
                      >
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
                        >
                          <div className="avatar avatar-sm" data-color={n.avatarColor}>
                            {n.avatarInitials}
                          </div>
                          <div>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                              {n.author}
                            </div>
                            <div style={{ fontSize: 'var(--font-size-xs)', color: '#94A3B8' }}>
                              {n.date}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p
                        style={{
                          fontSize: 'var(--font-size-sm)',
                          color: '#334155',
                          lineHeight: 'var(--line-height-loose)',
                          margin: 0,
                        }}
                      >
                        {n.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info tab */}
          {activeTab === 'info' && (
            <div>
              <div
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}
              >
                {[
                  { label: 'First Name', type: 'text', value: 'Arjun' },
                  { label: 'Last Name', type: 'text', value: 'Kumar' },
                  { label: 'Email Address', type: 'email', value: 'arjun.kumar@gmail.com' },
                  { label: 'Phone Number', type: 'tel', value: '+44 7700 900123' },
                  { label: 'Date of Birth', type: 'date', value: '1999-04-15' },
                  { label: 'Nationality', type: 'text', value: 'Indian' },
                  { label: 'Passport Number', type: 'text', value: 'P1234567' },
                ].map((field) => (
                  <div key={field.label}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#334155',
                        marginBottom: '8px',
                      }}
                    >
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      defaultValue={field.value}
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 12px',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--font-size-base)',
                        fontFamily: 'inherit',
                        outline: 'none',
                      }}
                    />
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '8px',
                    }}
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    defaultValue="42 Marine Drive, Mumbai, Maharashtra 400002, India"
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 12px',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-base)',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  marginTop: 'var(--space-5)',
                  display: 'flex',
                  gap: 'var(--space-2)',
                  justifyContent: 'flex-end',
                }}
              >
                <button type="button" className="btn btn-secondary">
                  Discard
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    toast({
                      type: 'success',
                      title: 'Profile updated!',
                      message: 'Changes have been saved.',
                    })
                  }
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Application Info */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Application Info</div>
            </div>
            <div
              className="card-body"
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
            >
              {[
                {
                  label: 'Stage',
                  value: <span className="badge badge-warning">Under Review</span>,
                },
                {
                  label: 'Destination',
                  value: (
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>🇬🇧 UK</span>
                  ),
                },
                {
                  label: 'Counselor',
                  value: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div className="avatar avatar-sm" data-color="green">
                        SM
                      </div>
                      <span style={{ fontSize: 'var(--font-size-sm)' }}>Sarah Mitchell</span>
                    </div>
                  ),
                },
                {
                  label: 'Added',
                  value: <span style={{ fontSize: 'var(--font-size-sm)' }}>2 Jun 2026</span>,
                },
                {
                  label: 'Portal Access',
                  value: <span className="badge badge-success">Active</span>,
                },
              ].map((row, i) => (
                <div key={row.label}>
                  {i > 0 && <hr className="divider" style={{ margin: '0 0 var(--space-3)' }} />}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: 'var(--font-size-sm)', color: '#64748B' }}>
                      {row.label}
                    </span>
                    {row.value}
                  </div>
                </div>
              ))}
            </div>
            <div className="card-footer">
              <select
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 36px 0 12px',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'inherit',
                  outline: 'none',
                  background: '#FFFFFF',
                  appearance: 'none',
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                }}
                onChange={() =>
                  toast({
                    type: 'success',
                    title: 'Stage updated!',
                    message: 'Student stage has been changed.',
                  })
                }
                defaultValue="review"
              >
                <option value="new">New Applicant</option>
                <option value="pending">Documents Pending</option>
                <option value="review">Documents Under Review</option>
                <option value="completed">Documents Completed</option>
              </select>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Quick Actions</div>
            </div>
            <div
              className="card-body"
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', width: '100%' }}
                onClick={() =>
                  toast({
                    type: 'info',
                    title: 'Reminder sent!',
                    message: 'Document reminder sent to Arjun.',
                  })
                }
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
                Send Document Reminder
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', width: '100%' }}
                onClick={() =>
                  toast({
                    type: 'info',
                    title: 'Downloading…',
                    message: 'All documents downloading as ZIP.',
                  })
                }
              >
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
                Download All Documents
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', width: '100%' }}
                onClick={() =>
                  toast({
                    type: 'info',
                    title: 'Password reset sent!',
                    message: 'Reset email sent to arjun.kumar@gmail.com.',
                  })
                }
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Reset Portal Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
