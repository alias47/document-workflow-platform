import { StaffTableSkeleton } from '@/features/staff/components/StaffTableSkeleton';

export default function StaffLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-[#F1F5F9] rounded-[6px] animate-pulse" />
      <div className="h-[38px] w-64 bg-[#F1F5F9] rounded-[8px] animate-pulse" />
      <StaffTableSkeleton />
    </div>
  );
}
