'use client';

export default function StaffError({ reset }: { reset: () => void }) {
  return (
    <div className="bg-white rounded-[12px] border border-[#E2E8F0] p-12 text-center">
      <p className="text-sm font-semibold text-[#DC2626]">Something went wrong loading staff</p>
      <button type="button" onClick={reset} className="mt-4 text-sm text-[#2563EB] hover:underline">
        Try again
      </button>
    </div>
  );
}
