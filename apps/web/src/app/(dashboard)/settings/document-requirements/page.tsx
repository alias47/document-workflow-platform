import type { Metadata } from 'next';

import { RequirementListClient } from '@/features/document-requirements/components/RequirementListClient';

export const metadata: Metadata = {
  title: 'Document Requirements',
};

export default function DocumentRequirementsPage() {
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
          Document Requirements
        </h1>
        <p style={{ fontSize: '14px', color: '#64748B' }}>
          Manage the document requirements that are assigned to every new applicant.
        </p>
      </div>
      <div className="card">
        <div className="card-body">
          <RequirementListClient />
        </div>
      </div>
    </div>
  );
}
