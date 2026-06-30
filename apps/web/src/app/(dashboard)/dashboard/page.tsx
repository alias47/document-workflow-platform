export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Welcome back. Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Placeholder stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Applicants', value: '—' },
          { label: 'Pending Review', value: '—' },
          { label: 'Documents Uploaded', value: '—' },
          { label: 'Completed', value: '—' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-[12px] border border-[#E2E8F0] p-5 shadow-sm"
          >
            <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-[#0F172A] mt-2">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
