'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useUpdateSettings } from '../hooks/use-settings';

import type { SystemSettings, UpdateSettingsData } from '../types';

import { useToast } from '@/components/ui/toast';

interface BrandingCardProps {
  settings: SystemSettings;
}

type FormValues = Pick<UpdateSettingsData, 'shortName' | 'primaryColor' | 'secondaryColor'>;

export function BrandingCard({ settings }: BrandingCardProps) {
  const { toast } = useToast();
  const updateMutation = useUpdateSettings();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      shortName: settings.shortName ?? '',
      primaryColor: settings.primaryColor ?? '#2563EB',
      secondaryColor: settings.secondaryColor ?? '#64748B',
    },
  });

  useEffect(() => {
    reset({
      shortName: settings.shortName ?? '',
      primaryColor: settings.primaryColor ?? '#2563EB',
      secondaryColor: settings.secondaryColor ?? '#64748B',
    });
  }, [settings, reset]);

  const primaryColor = watch('primaryColor');
  const secondaryColor = watch('secondaryColor');

  function onSubmit(values: FormValues) {
    const data: UpdateSettingsData = {};
    if (values.shortName) data.shortName = values.shortName;
    if (values.primaryColor) data.primaryColor = values.primaryColor;
    if (values.secondaryColor) data.secondaryColor = values.secondaryColor;
    updateMutation.mutate(data, {
      onSuccess: () =>
        toast({ type: 'success', title: 'Branding saved', message: 'Branding settings updated.' }),
      onError: (err) => {
        const msg = err instanceof Error ? err.message : 'Failed to save branding.';
        toast({ type: 'error', title: 'Save failed', message: msg });
      },
    });
  }

  return (
    <div className="card">
      <div className="card-body">
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
          Branding
        </h2>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
          Customize colors and short name used in the staff dashboard and applicant portal.
        </p>

        <form
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
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
              Short Name
            </label>
            <input
              {...register('shortName')}
              className="form-control"
              placeholder="e.g. Acme"
              maxLength={50}
            />
            <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
              Used where the full name does not fit.
            </p>
          </div>

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
                Primary Color
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="color"
                  {...register('primaryColor')}
                  style={{
                    width: 40,
                    height: 36,
                    padding: '2px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    cursor: 'pointer',
                  }}
                />
                <span style={{ fontSize: '13px', color: '#374151', fontFamily: 'monospace' }}>
                  {primaryColor}
                </span>
              </div>
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
                Secondary Color
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="color"
                  {...register('secondaryColor')}
                  style={{
                    width: 40,
                    height: 36,
                    padding: '2px',
                    borderRadius: '6px',
                    border: '1px solid #D1D5DB',
                    cursor: 'pointer',
                  }}
                />
                <span style={{ fontSize: '13px', color: '#374151', fontFamily: 'monospace' }}>
                  {secondaryColor}
                </span>
              </div>
            </div>
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
