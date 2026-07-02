'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { Staff, StaffRole, UpdateStaffData } from '../types/staff.types';

import { Button } from '@/components/ui/button';

interface EditStaffDialogProps {
  staff: Staff;
  isOpen: boolean;
  isPending: boolean;
  roles: StaffRole[];
  onConfirm: (data: UpdateStaffData) => void;
  onCancel: () => void;
}

export function EditStaffDialog({
  staff,
  isOpen,
  isPending,
  roles,
  onConfirm,
  onCancel,
}: EditStaffDialogProps) {
  const [form, setForm] = useState<UpdateStaffData>({});
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    if (isOpen) {
      setForm({
        firstName: staff.firstName,
        lastName: staff.lastName,
        phone: staff.phone ?? '',
        jobTitle: staff.jobTitle ?? '',
        roleId: staff.role?.id ?? '',
        isActive: staff.isActive,
      });
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    }
  }, [isOpen, staff]);

  if (!isOpen) return null;

  function field(key: keyof UpdateStaffData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value =
        key === 'isActive' && e.target instanceof HTMLInputElement
          ? e.target.checked
          : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };
  }

  function validate(): boolean {
    const errs: typeof errors = {};
    if (!form.firstName?.trim()) errs.firstName = 'Required';
    if (!form.lastName?.trim()) errs.lastName = 'Required';
    if (!form.roleId) errs.roleId = 'Role required';
    if (newPassword) {
      const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!re.test(newPassword))
        errs.password = 'Must be 8+ chars with upper, lower, digit, symbol';
      if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const payload: UpdateStaffData = {
      firstName: form.firstName?.trim(),
      lastName: form.lastName?.trim(),
      roleId: form.roleId,
      isActive: form.isActive,
      ...(form.phone?.trim() ? { phone: form.phone.trim() } : {}),
      ...(form.jobTitle?.trim() ? { jobTitle: form.jobTitle.trim() } : {}),
      ...(newPassword ? { password: newPassword } : {}),
    };
    onConfirm(payload);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-staff-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15,23,42,0.4)',
          backdropFilter: 'blur(2px)',
        }}
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'relative',
          background: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(15,23,42,0.15)',
          width: '100%',
          maxWidth: '560px',
          padding: '28px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#94A3B8',
            borderRadius: '6px',
          }}
        >
          <X size={16} />
        </button>

        <h2
          id="edit-staff-title"
          style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '20px' }}
        >
          Edit Staff — {staff.firstName} {staff.lastName}
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              marginBottom: '14px',
            }}
          >
            <Field label="First Name *" error={errors.firstName}>
              <input
                type="text"
                value={form.firstName ?? ''}
                onChange={field('firstName')}
                style={inputStyle}
              />
            </Field>
            <Field label="Last Name *" error={errors.lastName}>
              <input
                type="text"
                value={form.lastName ?? ''}
                onChange={field('lastName')}
                style={inputStyle}
              />
            </Field>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              marginBottom: '14px',
            }}
          >
            <Field label="Phone" error={errors.phone}>
              <input
                type="tel"
                value={form.phone ?? ''}
                onChange={field('phone')}
                style={inputStyle}
              />
            </Field>
            <Field label="Job Title" error={errors.jobTitle}>
              <input
                type="text"
                value={form.jobTitle ?? ''}
                onChange={field('jobTitle')}
                style={inputStyle}
              />
            </Field>
          </div>

          <Field label="Role *" error={errors.roleId}>
            <select value={form.roleId ?? ''} onChange={field('roleId')} style={inputStyle}>
              <option value="">Select a role…</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              margin: '14px 0',
            }}
          >
            <Field label="New Password (optional)" error={errors.password}>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors((p) => ({ ...p, password: undefined }));
                }}
                placeholder="Leave blank to keep current"
                style={inputStyle}
              />
            </Field>
            <Field label="Confirm New Password" error={errors.confirmPassword}>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((p) => ({ ...p, confirmPassword: undefined }));
                }}
                style={inputStyle}
              />
            </Field>
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#1E293B',
              cursor: 'pointer',
              marginBottom: '24px',
            }}
          >
            <input
              type="checkbox"
              checked={form.isActive ?? true}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              className="w-4 h-4 accent-[#2563EB]"
            />
            Active account
          </label>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" type="button" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '38px',
  padding: '0 12px',
  fontSize: '14px',
  color: '#1E293B',
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  outline: 'none',
};

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: 600,
          color: '#475569',
          marginBottom: '6px',
        }}
      >
        {label}
      </label>
      {children}
      {error && <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px' }}>{error}</p>}
    </div>
  );
}
