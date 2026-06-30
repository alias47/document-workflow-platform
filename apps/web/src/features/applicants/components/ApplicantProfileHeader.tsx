import { Archive, Mail, MapPin, Pencil, Phone } from 'lucide-react';

import { ApplicantStatusBadge, PortalStatusBadge } from './ApplicantStatusBadge';

import type { Applicant } from '@/features/applicants/types/applicant.types';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface ApplicantProfileHeaderProps {
  applicant: Applicant;
}

export function ApplicantProfileHeader({ applicant }: ApplicantProfileHeaderProps) {
  const fullName = `${applicant.firstName} ${applicant.lastName}`;

  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-start gap-5">
        {/* Avatar */}
        <Avatar name={fullName} size="lg" className="w-16 h-16 text-xl shrink-0" />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <h1 className="text-xl font-bold text-[#0F172A]">{fullName}</h1>
            <ApplicantStatusBadge status={applicant.status} />
            <PortalStatusBadge status={applicant.portalStatus} />
          </div>

          <p className="text-xs font-mono text-[#64748B] bg-[#F1F5F9] inline-block px-2 py-0.5 rounded mb-3">
            {applicant.applicantNumber}
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-1.5">
            <span className="flex items-center gap-1.5 text-sm text-[#475569]">
              <Mail size={13} className="text-[#94A3B8]" />
              {applicant.email}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-[#475569]">
              <Phone size={13} className="text-[#94A3B8]" />
              {applicant.phone}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-[#475569]">
              <MapPin size={13} className="text-[#94A3B8]" />
              {applicant.country}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <span className="text-[#64748B]">
              Nationality:{' '}
              <span className="font-medium text-[#1E293B]">{applicant.nationality}</span>
            </span>
            <span className="text-[#64748B]">
              Assigned to:{' '}
              <span className="font-medium text-[#1E293B]">{applicant.assignedStaff}</span>
            </span>
            <span className="text-[#64748B]">
              Added:{' '}
              <span className="font-medium text-[#1E293B]">
                {new Date(applicant.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary" size="sm">
            <Pencil size={13} />
            Edit
          </Button>
          <Button variant="danger-ghost" size="sm">
            <Archive size={13} />
            Archive
          </Button>
        </div>
      </div>
    </div>
  );
}
