export { ApplicantStatusChart } from './components/ApplicantStatusChart';
export { DashboardClient } from './components/DashboardClient';
export { DashboardEmpty } from './components/DashboardEmpty';
export { DashboardError } from './components/DashboardError';
export { DashboardSkeleton } from './components/DashboardSkeleton';
export { DashboardSummaryCards } from './components/DashboardSummaryCards';
export { DocumentStatusChart } from './components/DocumentStatusChart';
export { RecentActivities } from './components/RecentActivities';
export { RecentApplicants } from './components/RecentApplicants';
// Sprint 11.5 analytics widgets
export { ActivityFeed } from './components/widgets/ActivityFeed';
export { ApplicantStatusChart as StageStatusChart } from './components/widgets/ApplicantStatusChart';
export { DashboardHeader } from './components/widgets/DashboardHeader';
export { DocumentCompletionCard } from './components/widgets/DocumentCompletionCard';
export { KPICards } from './components/widgets/KPICards';
export { StaffWorkloadTable } from './components/widgets/StaffWorkloadTable';
export { WidgetState } from './components/widgets/WidgetState';
export { WorkflowChart } from './components/widgets/WorkflowChart';
export {
  useDashboard,
  useDashboardActivity,
  useDashboardSummary,
  useDashboardWorkload,
} from './hooks/use-dashboard';
export type * from './types/dashboard.types';
