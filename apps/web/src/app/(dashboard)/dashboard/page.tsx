import {
  DASHBOARD_MOCK,
  NotificationWidget,
  PendingTasks,
  QuickActions,
  RecentActivity,
  StatCardGrid,
  UpcomingDeadlines,
} from '@/features/dashboard';

export default function DashboardPage() {
  const { stats, activity, tasks, deadlines, notifications } = DASHBOARD_MOCK;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Dashboard</h1>
        <p className="text-sm text-[#64748B] mt-1">
          Welcome back. Here&apos;s what needs your attention today.
        </p>
      </div>

      {/* Statistics row */}
      <StatCardGrid stats={stats} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          <RecentActivity items={activity} />
          <PendingTasks tasks={tasks} />
        </div>

        {/* Right column — 1/3 width */}
        <div className="space-y-6">
          <QuickActions />
          <NotificationWidget notifications={notifications} />
          <UpcomingDeadlines deadlines={deadlines} />
        </div>
      </div>
    </div>
  );
}
