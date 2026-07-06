'use client';

import {
  useDashboardActivity,
  useDashboardSummary,
  useDashboardWorkload,
} from '../hooks/use-dashboard';
import { ActivityFeed } from './widgets/ActivityFeed';
import { ApplicantStatusChart } from './widgets/ApplicantStatusChart';
import { DashboardHeader } from './widgets/DashboardHeader';
import { DocumentCompletionCard } from './widgets/DocumentCompletionCard';
import { KPICards } from './widgets/KPICards';
import { StaffWorkloadTable } from './widgets/StaffWorkloadTable';
import { WidgetState } from './widgets/WidgetState';
import { WorkflowChart } from './widgets/WorkflowChart';

import { useAuth } from '@/hooks/use-auth';

/**
 * Dashboard composition (Sprint 11.5). Each widget fetches independently so one
 * failing endpoint never blanks the page (§12/§20). The workload widget is gated
 * server-side by `dashboard.workload.view`; when the endpoint returns 403 the
 * widget is simply not rendered.
 */
export function DashboardClient() {
  const { user } = useAuth();
  const firstName = user?.firstName ?? 'there';

  const summary = useDashboardSummary();
  const activity = useDashboardActivity();
  const workload = useDashboardWorkload();

  const kpis = summary.data?.kpis;
  const applicantStatus = summary.data?.applicantStatus ?? [];
  const workflowDistribution = summary.data?.workflowDistribution ?? [];
  const documentCompletion = summary.data?.documentCompletion;

  const showWorkload = !workload.isForbidden;

  return (
    <div className="page">
      <DashboardHeader firstName={firstName} />

      {/* KPI cards */}
      {summary.isLoading || summary.isError || !kpis ? (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <WidgetState
            title="Key Metrics"
            isLoading={summary.isLoading}
            isError={summary.isError}
            onRetry={() => void summary.refetch()}
          >
            <div />
          </WidgetState>
        </div>
      ) : (
        <div className="grid-4" style={{ marginBottom: 'var(--space-6)' }}>
          <KPICards kpis={kpis} />
        </div>
      )}

      {/* Applicant status + workflow distribution */}
      <div className="dashboard-grid-2" style={{ marginBottom: 'var(--space-5)' }}>
        <WidgetState
          title="Applicant Status"
          isLoading={summary.isLoading}
          isError={summary.isError}
          onRetry={() => void summary.refetch()}
        >
          <ApplicantStatusChart stages={applicantStatus} />
        </WidgetState>

        <WidgetState
          title="Workflow Distribution"
          isLoading={summary.isLoading}
          isError={summary.isError}
          onRetry={() => void summary.refetch()}
        >
          <WorkflowChart stages={workflowDistribution} />
        </WidgetState>
      </div>

      {/* Document completion + my tasks (tasks omitted → activity here) */}
      <div className="dashboard-grid-2" style={{ marginBottom: 'var(--space-5)' }}>
        <WidgetState
          title="Document Completion"
          isLoading={summary.isLoading}
          isError={summary.isError}
          onRetry={() => void summary.refetch()}
        >
          {documentCompletion ? (
            <DocumentCompletionCard completion={documentCompletion} />
          ) : (
            <div />
          )}
        </WidgetState>

        <WidgetState
          title="Recent Activity"
          isLoading={activity.isLoading}
          isError={activity.isError}
          onRetry={() => void activity.refetch()}
        >
          <ActivityFeed activities={activity.data ?? []} />
        </WidgetState>
      </div>

      {/* Staff workload (RBAC — managers/admins only) */}
      {showWorkload && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <WidgetState
            title="Staff Workload"
            isLoading={workload.isLoading}
            isError={workload.isError && !workload.isForbidden}
            onRetry={() => void workload.refetch()}
          >
            <StaffWorkloadTable workload={workload.data ?? []} />
          </WidgetState>
        </div>
      )}
    </div>
  );
}
