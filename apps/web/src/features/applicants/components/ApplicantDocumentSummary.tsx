import { CheckCircle, Clock, FileText, XCircle } from 'lucide-react';

import type { Applicant } from '@/features/applicants/types/applicant.types';

import { Badge } from '@/components/ui/badge';

interface ApplicantDocumentSummaryProps {
  applicant: Applicant;
}

export function ApplicantDocumentSummary({ applicant }: ApplicantDocumentSummaryProps) {
  const { documents } = applicant;

  const items = [
    {
      label: 'Approved',
      count: documents.approved,
      icon: <CheckCircle size={14} className="text-[#16A34A]" />,
      badge: 'success' as const,
    },
    {
      label: 'Under Review',
      count: documents.underReview,
      icon: <Clock size={14} className="text-[#D97706]" />,
      badge: 'warning' as const,
    },
    {
      label: 'Missing',
      count: documents.missing,
      icon: <FileText size={14} className="text-[#94A3B8]" />,
      badge: 'secondary' as const,
    },
    {
      label: 'Rejected',
      count: documents.rejected,
      icon: <XCircle size={14} className="text-[#DC2626]" />,
      badge: 'danger' as const,
    },
  ];

  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#0F172A]">Documents</h3>
        <span className="text-xs text-[#64748B]">
          {documents.approved}/{documents.total} approved
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-3 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0]"
          >
            <div className="flex items-center gap-2">
              {item.icon}
              <span className="text-xs text-[#475569]">{item.label}</span>
            </div>
            <Badge variant={item.badge}>{item.count}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
