'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useUpdateSettings } from '../hooks/use-settings';

import type { SystemSettings, UpdateSettingsData } from '../types';

import { useToast } from '@/components/ui/toast';

interface EmailNotificationSettingsCardProps {
  settings: SystemSettings;
}

type FormValues = Pick<UpdateSettingsData, 'emailEnabled'>;

export function EmailNotificationSettingsCard({ settings }: EmailNotificationSettingsCardProps) {
  const { toast } = useToast();
  const updateMutation = useUpdateSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { emailEnabled: settings.emailEnabled },
  });

  useEffect(() => {
    reset({ emailEnabled: settings.emailEnabled });
  }, [settings, reset]);

  function onSubmit(values: FormValues) {
    updateMutation.mutate(values as UpdateSettingsData, {
      onSuccess: () =>
        toast({
          type: 'success',
          title: 'Email settings saved',
          message: 'Outgoing email preference updated.',
        }),
      onError: (err) => {
        const msg = err instanceof Error ? err.message : 'Failed to save email settings.';
        toast({ type: 'error', title: 'Save failed', message: msg });
      },
    });
  }

  return (
    <div className="card">
      <div className="card-body">
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '4px',
            gap: '12px',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
            Email Notifications
          </h2>
          <Link
            href="/settings/notifications"
            style={{ fontSize: '13px', color: '#2563EB', fontWeight: 500, whiteSpace: 'nowrap' }}
          >
            View history →
          </Link>
        </div>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
          Master switch for all outgoing email. When disabled, no emails are queued or sent.
        </p>

        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 0',
            }}
          >
            <div>
              <p
                style={{ fontSize: '14px', fontWeight: 500, color: '#0F172A', marginBottom: '2px' }}
              >
                Enable Outgoing Email
              </p>
              <p style={{ fontSize: '12px', color: '#64748B' }}>
                Turn all system email notifications on or off.
              </p>
            </div>
            <input
              type="checkbox"
              {...register('emailEnabled')}
              style={{
                width: 18,
                height: 18,
                accentColor: '#2563EB',
                cursor: 'pointer',
                marginLeft: '16px',
                flexShrink: 0,
              }}
              aria-label="Enable Outgoing Email"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
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
