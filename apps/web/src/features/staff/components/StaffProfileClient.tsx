'use client';

import { ArrowLeft, Edit, UserMinus, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { AssignApplicantsDialog } from './AssignApplicantsDialog';
import { DeleteStaffDialog } from './DeleteStaffDialog';
import { EditStaffDialog } from './EditStaffDialog';
import { StaffStatusBadge } from './StaffStatusBadge';
import {
  useAssignApplicants,
  useDeleteStaff,
  useStaff,
  useStaffApplicants,
  useStaffRoles,
  useUpdateStaff,
  useUpdateStaffStatus,
} from '../hooks/use-staff';

import type { UpdateStaffData } from '../types/staff.types';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

interface StaffProfileClientProps {
  staffId: string;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function StaffProfileClient({ staffId }: StaffProfileClientProps) {
  const { toast } = useToast();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showAssign, setShowAssign] = useState(false);

  const { data: staffData, isLoading, isError } = useStaff(staffId);
  const { data: applicantsData } = useStaffApplicants(staffId, 1, 100);
  const { data: rolesData } = useStaffRoles();

  const updateMutation = useUpdateStaff();
  const statusMutation = useUpdateStaffStatus();
  const deleteMutation = useDeleteStaff();
  const assignMutation = useAssignApplicants();

  const staff = staffData?.data;
  const currentApplicants = applicantsData?.data ?? [];
  const roles = rolesData?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="bg-white rounded-[12px] border border-[#E2E8F0] p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !staff) {
    return (
      <div className="bg-white rounded-[12px] border border-[#E2E8F0] p-12 text-center">
        <p className="text-sm text-[#DC2626] font-medium">Staff member not found</p>
        <Link href="/staff" className="text-sm text-[#2563EB] mt-2 inline-block hover:underline">
          Back to Staff
        </Link>
      </div>
    );
  }

  async function handleUpdate(data: UpdateStaffData) {
    try {
      await updateMutation.mutateAsync({ id: staffId, data });
      setShowEdit(false);
      toast({ type: 'success', title: 'Staff member updated' });
    } catch {
      toast({ type: 'error', title: 'Failed to update staff member' });
    }
  }

  async function handleToggleStatus() {
    const newStatus = staffData?.data?.isActive ? 'inactive' : 'active';
    try {
      await statusMutation.mutateAsync({ id: staffId, data: { status: newStatus } });
      toast({
        type: 'success',
        title: `Staff member ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
      });
    } catch {
      toast({ type: 'error', title: 'Failed to update status' });
    }
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(staffId);
      toast({ type: 'success', title: 'Staff member deleted' });
      window.location.href = '/staff';
    } catch {
      toast({ type: 'error', title: 'Failed to delete staff member' });
    }
  }

  async function handleAssign(applicantIds: string[]) {
    try {
      await assignMutation.mutateAsync({ id: staffId, data: { applicantIds } });
      setShowAssign(false);
      toast({ type: 'success', title: 'Applicant assignments updated' });
    } catch {
      toast({ type: 'error', title: 'Failed to update assignments' });
    }
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link
        href="/staff"
        className="inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#1E293B] transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Staff
      </Link>

      {/* Profile card */}
      <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Avatar
              name={`${staff.firstName} ${staff.lastName}`}
              size="lg"
              className="w-16 h-16 text-lg"
            />
            <div>
              <h1 className="text-xl font-bold text-[#0F172A]">
                {staff.firstName} {staff.lastName}
              </h1>
              {staff.jobTitle && <p className="text-sm text-[#64748B] mt-0.5">{staff.jobTitle}</p>}
              <div className="flex items-center gap-2 mt-2">
                <StaffStatusBadge status={staff.status} />
                {staff.role && <Badge variant="info">{staff.role.name}</Badge>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleStatus}
              loading={statusMutation.isPending}
            >
              {staff.isActive ? <UserMinus size={14} /> : <UserPlus size={14} />}
              {staff.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>
              <Edit size={14} />
              Edit
            </Button>
            <Button variant="danger-ghost" size="sm" onClick={() => setShowDelete(true)}>
              Delete
            </Button>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#F1F5F9]">
          <InfoItem label="Email" value={staff.email} />
          <InfoItem label="Phone" value={staff.phone ?? '—'} />
          <InfoItem label="Last Login" value={formatDateTime(staff.lastLoginAt)} />
          <InfoItem label="Member Since" value={formatDate(staff.createdAt)} />
        </div>
      </div>

      {/* Assigned applicants */}
      <div className="bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
          <div>
            <h2 className="text-sm font-bold text-[#1E293B]">Assigned Applicants</h2>
            <p className="text-xs text-[#64748B] mt-0.5">{currentApplicants.length} assigned</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowAssign(true)}>
            Manage Assignments
          </Button>
        </div>

        {currentApplicants.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-[#94A3B8]">No applicants assigned to this staff member</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#F1F5F9]">
            {currentApplicants.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-semibold text-[#1E293B]">
                    {a.firstName} {a.lastName}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {a.applicantNumber}
                    {a.email ? ` · ${a.email}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {a.assignments[0]?.isPrimary && <Badge variant="info">Primary</Badge>}
                  <Badge
                    variant={
                      a.status === 'active'
                        ? 'success'
                        : a.status === 'archived'
                          ? 'secondary'
                          : 'warning'
                    }
                  >
                    {a.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Dialogs */}
      <EditStaffDialog
        staff={staff}
        isOpen={showEdit}
        isPending={updateMutation.isPending}
        roles={roles}
        onConfirm={handleUpdate}
        onCancel={() => setShowEdit(false)}
      />

      <DeleteStaffDialog
        staff={staff}
        isOpen={showDelete}
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />

      <AssignApplicantsDialog
        staff={staff}
        currentApplicants={currentApplicants}
        allApplicants={[]}
        isOpen={showAssign}
        isPending={assignMutation.isPending}
        onConfirm={handleAssign}
        onCancel={() => setShowAssign(false)}
      />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
      <p className="text-sm text-[#1E293B] mt-1 font-medium">{value}</p>
    </div>
  );
}
