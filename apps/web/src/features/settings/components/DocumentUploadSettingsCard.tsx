'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useUpdateSettings } from '../hooks/use-settings';

import type { SystemSettings, UpdateSettingsData } from '../types';

import { useToast } from '@/components/ui/toast';

interface DocumentUploadSettingsCardProps {
  settings: SystemSettings;
}

type FormValues = Pick<
  UpdateSettingsData,
  | 'uploadMaxSizeMb'
  | 'uploadMaxFilesPerReq'
  | 'uploadAllowMultiple'
  | 'uploadAllowReplace'
  | 'uploadRequireApprovalForResubmit'
>;

export function DocumentUploadSettingsCard({ settings }: DocumentUploadSettingsCardProps) {
  const { toast } = useToast();
  const updateMutation = useUpdateSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      uploadMaxSizeMb: settings.uploadMaxSizeMb,
      uploadMaxFilesPerReq: settings.uploadMaxFilesPerReq,
      uploadAllowMultiple: settings.uploadAllowMultiple,
      uploadAllowReplace: settings.uploadAllowReplace,
      uploadRequireApprovalForResubmit: settings.uploadRequireApprovalForResubmit,
    },
  });

  useEffect(() => {
    reset({
      uploadMaxSizeMb: settings.uploadMaxSizeMb,
      uploadMaxFilesPerReq: settings.uploadMaxFilesPerReq,
      uploadAllowMultiple: settings.uploadAllowMultiple,
      uploadAllowReplace: settings.uploadAllowReplace,
      uploadRequireApprovalForResubmit: settings.uploadRequireApprovalForResubmit,
    });
  }, [settings, reset]);

  function onSubmit(values: FormValues) {
    updateMutation.mutate(
      {
        uploadMaxSizeMb: Number(values.uploadMaxSizeMb),
        uploadMaxFilesPerReq: Number(values.uploadMaxFilesPerReq),
        uploadAllowMultiple: values.uploadAllowMultiple,
        uploadAllowReplace: values.uploadAllowReplace,
        uploadRequireApprovalForResubmit: values.uploadRequireApprovalForResubmit,
      } as UpdateSettingsData,
      {
        onSuccess: () =>
          toast({
            type: 'success',
            title: 'Upload settings saved',
            message: 'Document upload settings updated.',
          }),
        onError: (err) => {
          const msg = err instanceof Error ? err.message : 'Failed to save upload settings.';
          toast({ type: 'error', title: 'Save failed', message: msg });
        },
      },
    );
  }

  const toggleFields: {
    key: keyof Pick<
      FormValues,
      'uploadAllowMultiple' | 'uploadAllowReplace' | 'uploadRequireApprovalForResubmit'
    >;
    label: string;
    description: string;
  }[] = [
    {
      key: 'uploadAllowMultiple',
      label: 'Allow Multiple Uploads',
      description: 'Applicants can upload more than one file per requirement.',
    },
    {
      key: 'uploadAllowReplace',
      label: 'Allow Replace Upload',
      description: 'Applicants can replace a previously uploaded file.',
    },
    {
      key: 'uploadRequireApprovalForResubmit',
      label: 'Require Approval Before Resubmission',
      description: 'A rejected file must be approved before a new one can be uploaded.',
    },
  ];

  return (
    <div className="card">
      <div className="card-body">
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
          Document Upload Settings
        </h2>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
          Organization-wide upload behaviour applied to every applicant.
        </p>

        <form
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Maximum Upload Size (MB)
              </label>
              <input
                type="number"
                {...register('uploadMaxSizeMb', { min: 1, max: 100 })}
                className="form-control"
                min={1}
                max={100}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Maximum Files Per Requirement
              </label>
              <input
                type="number"
                {...register('uploadMaxFilesPerReq', { min: 1, max: 50 })}
                className="form-control"
                min={1}
                max={50}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {toggleFields.map((field, idx) => (
              <div
                key={field.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: idx < toggleFields.length - 1 ? '1px solid #F1F5F9' : undefined,
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
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
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
