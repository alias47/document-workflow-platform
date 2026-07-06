import Link from 'next/link';

const REPORT_LINKS = [
  {
    href: '/reports/applicants',
    title: 'Applicant Report',
    description:
      'View and export applicant data with filtering by status, consultant, stage, and country.',
  },
  {
    href: '/reports/documents',
    title: 'Document Report',
    description:
      'Track document completion rates per applicant — uploaded, approved, rejected, and pending counts.',
  },
  {
    href: '/reports/workflow',
    title: 'Workflow Report',
    description: 'See the current distribution of applicants across all workflow stages.',
  },
  {
    href: '/reports/staff-workload',
    title: 'Staff Workload Report',
    description: 'View how many active and completed applicants each staff member is managing.',
  },
];

export default function ReportsIndexPage() {
  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
        Reports
      </h1>
      <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '28px' }}>
        Generate and export operational reports. All reports are read-only and scoped to your
        organization.
      </p>

      <div style={{ display: 'grid', gap: '12px' }}>
        {REPORT_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: 'block',
              padding: '20px 24px',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              background: '#fff',
            }}
          >
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
              {link.title}
            </p>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
