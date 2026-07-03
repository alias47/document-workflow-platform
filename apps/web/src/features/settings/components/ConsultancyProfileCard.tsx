'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { LogoUploader } from './LogoUploader';
import { useUpdateSettings } from '../hooks/use-settings';

import type { SystemSettings, UpdateSettingsData } from '../types';

import { useToast } from '@/components/ui/toast';

interface ConsultancyProfileCardProps {
  settings: SystemSettings;
}

type FormValues = Pick<
  UpdateSettingsData,
  | 'name'
  | 'legalName'
  | 'contactEmail'
  | 'contactPhone'
  | 'website'
  | 'address'
  | 'city'
  | 'country'
  | 'postalCode'
  | 'timezone'
  | 'description'
>;

export function ConsultancyProfileCard({ settings }: ConsultancyProfileCardProps) {
  const { toast } = useToast();
  const updateMutation = useUpdateSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: settings.name,
      legalName: settings.legalName ?? '',
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone ?? '',
      website: settings.website ?? '',
      address: settings.address ?? '',
      city: settings.city ?? '',
      country: settings.country ?? '',
      postalCode: settings.postalCode ?? '',
      timezone: settings.timezone,
      description: settings.description ?? '',
    },
  });

  useEffect(() => {
    reset({
      name: settings.name,
      legalName: settings.legalName ?? '',
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone ?? '',
      website: settings.website ?? '',
      address: settings.address ?? '',
      city: settings.city ?? '',
      country: settings.country ?? '',
      postalCode: settings.postalCode ?? '',
      timezone: settings.timezone,
      description: settings.description ?? '',
    });
  }, [settings, reset]);

  function onSubmit(values: FormValues) {
    const data: UpdateSettingsData = {};
    (Object.keys(values) as (keyof FormValues)[]).forEach((key) => {
      const v = values[key];
      if (v !== undefined && v !== '') {
        (data as Record<string, unknown>)[key] = v;
      } else if (v === '') {
        (data as Record<string, unknown>)[key] = null;
      }
    });
    updateMutation.mutate(data, {
      onSuccess: () =>
        toast({ type: 'success', title: 'Profile saved', message: 'Consultancy profile updated.' }),
      onError: (err) => {
        const msg = err instanceof Error ? err.message : 'Failed to save profile.';
        toast({ type: 'error', title: 'Save failed', message: msg });
      },
    });
  }

  return (
    <div className="card">
      <div className="card-body">
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
          Consultancy Profile
        </h2>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
          Basic information about your consultancy.
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '8px',
            }}
          >
            Logo
          </label>
          <LogoUploader currentLogoKey={settings.logoKey} />
        </div>

        <form
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Consultancy Name" required>
              <input
                {...register('name', { required: true })}
                className="form-control"
                placeholder="Acme Consultancy"
              />
            </Field>
            <Field label="Legal Name">
              <input
                {...register('legalName')}
                className="form-control"
                placeholder="Acme Consultancy Ltd."
              />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Contact Email" required>
              <input
                {...register('contactEmail', { required: true })}
                type="email"
                className="form-control"
              />
            </Field>
            <Field label="Phone Number">
              <input
                {...register('contactPhone')}
                className="form-control"
                placeholder="+1 555 000 0000"
              />
            </Field>
          </div>

          <Field label="Website">
            <input
              {...register('website')}
              className="form-control"
              placeholder="https://example.com"
            />
          </Field>

          <Field label="Address">
            <input
              {...register('address')}
              className="form-control"
              placeholder="123 Main Street"
            />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Field label="City">
              <input {...register('city')} className="form-control" />
            </Field>
            <Field label="Country">
              <input {...register('country')} className="form-control" />
            </Field>
            <Field label="Postal Code">
              <input {...register('postalCode')} className="form-control" />
            </Field>
          </div>

          <Field label="Time Zone">
            <input {...register('timezone')} className="form-control" placeholder="UTC" />
          </Field>

          <Field label="Description">
            <textarea
              {...register('description')}
              className="form-control"
              rows={3}
              placeholder="Short description of your consultancy"
            />
          </Field>

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

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
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
        {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
      </label>
      {children}
    </div>
  );
}
