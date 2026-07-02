'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { CreateStaffDialog } from './CreateStaffDialog';
import { DeleteStaffDialog } from './DeleteStaffDialog';
import { EditStaffDialog } from './EditStaffDialog';
import { StaffFilters } from './StaffFilters';
import { StaffTable } from './StaffTable';
import { StaffTableSkeleton } from './StaffTableSkeleton';
import {
  useCreateStaff,
  useDeleteStaff,
  useStaffList,
  useStaffRoles,
  useUpdateStaff,
  useUpdateStaffStatus,
} from '../hooks/use-staff';

import type {
  CreateStaffData,
  Staff,
  StaffListParams,
  UpdateStaffData,
} from '../types/staff.types';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

const EMPTY_PARAMS: StaffListParams = {
  page: 1,
  pageSize: 25,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

export function StaffListClient() {
  const { toast } = useToast();
  const [params, setParams] = useState<StaffListParams>(EMPTY_PARAMS);
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Staff | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);

  const { data, isLoading, isError } = useStaffList(params);
  const { data: rolesData } = useStaffRoles();
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const statusMutation = useUpdateStaffStatus();
  const deleteMutation = useDeleteStaff();

  const staff = data?.data ?? [];
  const meta = data?.meta;
  const roles = rolesData?.data ?? [];

  function updateParams(updates: Partial<StaffListParams>) {
    setParams((prev) => ({ ...prev, ...updates }));
  }

  function clearFilters() {
    setParams(EMPTY_PARAMS);
  }

  async function handleCreate(formData: CreateStaffData) {
    try {
      await createMutation.mutateAsync(formData);
      setShowCreate(false);
      toast({ type: 'success', title: 'Staff member created successfully' });
    } catch {
      toast({ type: 'error', title: 'Failed to create staff member' });
    }
  }

  async function handleUpdate(formData: UpdateStaffData) {
    if (!editTarget) return;
    try {
      await updateMutation.mutateAsync({ id: editTarget.id, data: formData });
      setEditTarget(null);
      toast({ type: 'success', title: 'Staff member updated' });
    } catch {
      toast({ type: 'error', title: 'Failed to update staff member' });
    }
  }

  async function handleToggleStatus(member: Staff) {
    try {
      const status = member.isActive ? 'inactive' : 'active';
      await statusMutation.mutateAsync({ id: member.id, data: { status } });
      toast({
        type: 'success',
        title: `Staff member ${status === 'active' ? 'activated' : 'deactivated'}`,
      });
    } catch {
      toast({ type: 'error', title: 'Failed to update status' });
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      toast({ type: 'success', title: 'Staff member deleted' });
    } catch {
      toast({ type: 'error', title: 'Failed to delete staff member' });
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Staff</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            {meta ? `${meta.totalItems} total members` : 'Manage your organization team'}
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          Add Staff
        </Button>
      </div>

      {/* Filters */}
      <StaffFilters params={params} roles={roles} onChange={updateParams} onClear={clearFilters} />

      {/* Table */}
      {isLoading ? (
        <StaffTableSkeleton />
      ) : isError ? (
        <div className="bg-white rounded-[12px] border border-[#E2E8F0] p-12 text-center">
          <p className="text-sm text-[#DC2626] font-medium">Failed to load staff</p>
          <p className="text-xs text-[#94A3B8] mt-1">Please refresh the page</p>
        </div>
      ) : (
        <StaffTable
          staff={staff}
          currentPage={params.page ?? 1}
          pageSize={params.pageSize ?? 25}
          totalItems={meta?.totalItems ?? 0}
          onPageChange={(page) => updateParams({ page })}
          onEdit={setEditTarget}
          onToggleStatus={handleToggleStatus}
          onDelete={setDeleteTarget}
        />
      )}

      {/* Dialogs */}
      <CreateStaffDialog
        isOpen={showCreate}
        isPending={createMutation.isPending}
        roles={roles}
        onConfirm={handleCreate}
        onCancel={() => setShowCreate(false)}
      />

      {editTarget && (
        <EditStaffDialog
          staff={editTarget}
          isOpen={Boolean(editTarget)}
          isPending={updateMutation.isPending}
          roles={roles}
          onConfirm={handleUpdate}
          onCancel={() => setEditTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteStaffDialog
          staff={deleteTarget}
          isOpen={Boolean(deleteTarget)}
          isPending={deleteMutation.isPending}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
