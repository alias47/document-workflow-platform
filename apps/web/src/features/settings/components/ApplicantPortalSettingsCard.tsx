'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useUpdateSettings } from '../hooks/use-settings';

import type { SystemSettings, UpdateSettingsData } from '../types';

import { useToast } from '@/components/ui/toast';

interface ApplicantPortalSettingsCardProps {
  settings: SystemSettings;
}

type FormValues = Pick<
  UpdateSettingsData,
  | 'portalEnabled'
  | 'portalAllowProfileEdit'
  | 'portalAllowPasswordChange'
  | 'portalAllowDocUpload'
  | 'portalShowConsultant'
  | 'portalShowContactInfo'
>;

const PORTAL_FIELDS: { key: keyof FormValues; label: string; description: string }[] = [
  {
    key: 'portalEnabled',
    label: 'Enable Applicant Portal',
    description: 'Allow applicants to access their portal.',
  },
  {
    key: 'portalAllowProfileEdit',
    label: 'Allow Applicant Profile Editing',
    description: 'Applicants can update their personal information.',
  },
  {
    key: 'portalAllowPasswordChange',
    label: 'Allow Applicant Password Change',
    description: 'Applicants can change their own password.',
  },
  {
    key: 'portalAllowDocUpload',
    label: 'Allow Applicant Document Upload',
    description: 'Applicants can upload documents directly.',
  },
  {
    key: 'portalShowConsultant',
    label: 'Show Assigned Consultant',
    description: 'Display the assigned consultant name to applicants.',
  },
  {
    key: 'portalShowContactInfo',
    label: 'Show Consultancy Contact Information',
    description: 'Show phone, email, and website to applicants.',
  },
];

export function ApplicantPortalSettingsCard({ settings }: ApplicantPortalSettingsCardProps) {
  const { toast } = useToast();
  const updateMutation = useUpdateSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      portalEnabled: settings.portalEnabled,
      portalAllowProfileEdit: settings.portalAllowProfileEdit,
      portalAllowPasswordChange: settings.portalAllowPasswordChange,
      portalAllowDocUpload: settings.portalAllowDocUpload,
      portalShowConsultant: settings.portalShowConsultant,
      portalShowContactInfo: settings.portalShowContactInfo,
    },
  });

  useEffect(() => {
    reset({
      portalEnabled: settings.portalEnabled,
      portalAllowProfileEdit: settings.portalAllowProfileEdit,
      portalAllowPasswordChange: settings.portalAllowPasswordChange,
      portalAllowDocUpload: settings.portalAllowDocUpload,
      portalShowConsultant: settings.portalShowConsultant,
      portalShowContactInfo: settings.portalShowContactInfo,
    });
  }, [settings, reset]);

  function onSubmit(values: FormValues) {
    updateMutation.mutate(values as UpdateSettingsData, {
      onSuccess: () =>
        toast({
          type: 'success',
          title: 'Portal settings saved',
          message: 'Changes take effect immediately.',
        }),
      onError: (err) => {
        const msg = err instanceof Error ? err.message : 'Failed to save portal settings.';
        toast({ type: 'error', title: 'Save failed', message: msg });
      },
    });
  }

  return (
    <div className="card">
      <div className="card-body">
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
          Applicant Portal Settings
        </h2>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
          Control what applicants can see and do in their portal. Changes take effect immediately.
        </p>

        <form
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          style={{ display: 'flex', flexDirection: 'column', gap: 0 }}
        >
          {PORTAL_FIELDS.map((field, idx) => (
            <div
              key={field.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: idx < PORTAL_FIELDS.length - 1 ? '1px solid #F1F5F9' : undefined,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#0F172A',
                    marginBottom: '2px',
                  }}
                >
                  {field.label}
                </p>
                <p style={{ fontSize: '12px', color: '#64748B' }}>{field.description}</p>
              </div>
              <input
                type="checkbox"
                {...register(field.key)}
                style={{
                  width: 18,
                  height: 18,
                  accentColor: '#2563EB',
                  cursor: 'pointer',
                  marginLeft: '16px',
                  flexShrink: 0,
                }}
                aria-label={field.label}
              />
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={!isDirty || isSubmitting || updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
