import { Skeleton } from '@/components/ui/skeleton';

export default function StaffProfileLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-32" />
      <div className="bg-white rounded-[12px] border border-[#E2E8F0] p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-[#F1F5F9]">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
