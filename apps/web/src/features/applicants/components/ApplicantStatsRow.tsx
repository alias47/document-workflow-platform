import { CheckCircle, Clock, PauseCircle, Users } from 'lucide-react';

import type { Applicant } from '@/features/applicants/types/applicant.types';

interface StatItemProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  valueColor?: string;
}

function StatItem({ label, value, icon, iconBg, valueColor = 'text-[#0F172A]' }: StatItemProps) {
  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm p-5 flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${iconBg}`}
      >
        {icon}
      </div>
      <div>
        <p className={`text-2xl font-bold leading-none ${valueColor}`}>{value}</p>
        <p className="text-xs text-[#64748B] mt-1">{label}</p>
      </div>
    </div>
  );
}

interface ApplicantStatsRowProps {
  applicants: Applicant[];
}

export function ApplicantStatsRow({ applicants }: ApplicantStatsRowProps) {
  const total = applicants.length;
  const active = applicants.filter((a) => a.status === 'active').length;
  const onHold = applicants.filter((a) => a.status === 'on_hold').length;
  const completed = applicants.filter((a) => a.status === 'completed').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatItem
        label="Total Applicants"
        value={total}
        icon={<Users size={20} className="text-[#2563EB]" />}
        iconBg="bg-[#DBEAFE]"
      />
      <StatItem
        label="Active"
        value={active}
        icon={<CheckCircle size={20} className="text-[#16A34A]" />}
        iconBg="bg-[#DCFCE7]"
        valueColor="text-[#16A34A]"
      />
      <StatItem
        label="On Hold"
        value={onHold}
        icon={<PauseCircle size={20} className="text-[#D97706]" />}
        iconBg="bg-[#FEF3C7]"
        valueColor="text-[#D97706]"
      />
      <StatItem
        label="Completed"
        value={completed}
        icon={<Clock size={20} className="text-[#7C3AED]" />}
        iconBg="bg-[#EDE9FE]"
        valueColor="text-[#7C3AED]"
      />
    </div>
  );
}
