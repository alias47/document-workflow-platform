'use client';

import { useState } from 'react';

import { InvitationStatusBadge } from './InvitationStatusBadge';
import { ResendInvitationDialog } from './ResendInvitationDialog';
import { RevokeInvitationDialog } from './RevokeInvitationDialog';
import { SendInvitationDialog } from './SendInvitationDialog';
import {
  useInvitation,
  useResendInvitation,
  useRevokeInvitation,
  useSendInvitation,
} from '../hooks/use-invitation';

import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

type Dialog = 'send' | 'resend' | 'revoke' | null;

interface Props {
  applicantId: string;
  applicantName: string;
  applicantEmail: string | undefined;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function PortalAccountCard({ applicantId, applicantName, applicantEmail }: Props) {
  const { toast } = useToast();
  const [dialog, setDialog] = useState<Dialog>(null);

  const { data, isLoading, isError } = useInvitation(applicantId);
  const sendMutation = useSendInvitation(applicantId);
  const resendMutation = useResendInvitation(applicantId);
  const revokeMutation = useRevokeInvitation(applicantId);

  const invitation = data?.data;
  const status = invitation?.status ?? 'none';

  function handleSend() {
    sendMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          type: 'success',
          title: 'Invitation sent',
          message: `Invitation sent to ${applicantName}.`,
        });
        setDialog(null);
      },
      onError: (err: unknown) => {
        const msg = (err as { message?: string })?.message ?? 'Failed to send invitation.';
        toast({ type: 'error', title: 'Error', message: msg });
        setDialog(null);
      },
    });
  }

  function handleResend() {
    resendMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          type: 'success',
          title: 'Invitation resent',
          message: `New invitation sent to ${applicantName}.`,
        });
        setDialog(null);
      },
      onError: (err: unknown) => {
        const msg = (err as { message?: string })?.message ?? 'Failed to resend invitation.';
        toast({ type: 'error', title: 'Error', message: msg });
        setDialog(null);
      },
    });
  }

  function handleRevoke() {
    revokeMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          type: 'success',
          title: 'Invitation revoked',
          message: 'The invitation has been invalidated.',
        });
        setDialog(null);
      },
      onError: (err: unknown) => {
        const msg = (err as { message?: string })?.message ?? 'Failed to revoke invitation.';
        toast({ type: 'error', title: 'Error', message: msg });
        setDialog(null);
      },
    });
  }

  function handleCopyLink() {
    if (!invitation) return;
    const baseUrl = window.location.origin;
    void navigator.clipboard.writeText(`${baseUrl}/applicant/activate`).then(() => {
      toast({
        type: 'success',
        title: 'Copied',
        message: 'Activation page link copied to clipboard.',
      });
    });
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="card-header">
          <Skeleton className="h-4 w-32" />
        </div>
        <div
          className="card-body"
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
            Portal Account
          </h3>
        </div>
        <div className="card-body">
          <p style={{ fontSize: '14px', color: '#DC2626' }}>
            Failed to load portal account status.
          </p>
        </div>
      </div>
    );
  }

  const showSend = status === 'none' || status === 'expired';
  const showResend = status === 'pending';
  const showRevoke = status === 'pending';
  const showCopy = status === 'pending';

  return (
    <div className="card">
      <div
        className="card-header"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
          Portal Account
        </h3>
        <InvitationStatusBadge status={status} />
      </div>

      <div className="card-body">
        {!applicantEmail && (
          <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px' }}>
            This applicant has no email address. Add an email before sending an invitation.
          </p>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: invitation && status !== 'none' ? '20px' : '0',
          }}
        >
          {invitation && status !== 'none' && (
            <>
              <div>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '2px' }}>
                  Invited By
                </p>
                <p style={{ fontSize: '14px', color: '#1E293B', fontWeight: 500 }}>
                  {invitation.invitedBy
                    ? `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`
                    : '—'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '2px' }}>
                  Invitation Date
                </p>
                <p style={{ fontSize: '14px', color: '#1E293B', fontWeight: 500 }}>
                  {formatDate(invitation.createdAt)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '2px' }}>
                  Expiration
                </p>
                <p style={{ fontSize: '14px', color: '#1E293B', fontWeight: 500 }}>
                  {formatDate(invitation.expiresAt)}
                </p>
              </div>
              {invitation.acceptedAt && (
                <div>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '2px' }}>
                    Activated Date
                  </p>
                  <p style={{ fontSize: '14px', color: '#1E293B', fontWeight: 500 }}>
                    {formatDate(invitation.acceptedAt)}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {(showSend || showResend || showRevoke || showCopy) && applicantEmail && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {showSend && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setDialog('send')}
              >
                Send Invitation
              </button>
            )}
            {showResend && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setDialog('resend')}
              >
                Resend Invitation
              </button>
            )}
            {showCopy && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleCopyLink}>
                Copy Invitation Link
              </button>
            )}
            {showRevoke && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ color: '#DC2626' }}
                onClick={() => setDialog('revoke')}
              >
                Revoke Invitation
              </button>
            )}
          </div>
        )}
      </div>

      {dialog === 'send' && (
        <SendInvitationDialog
          applicantName={applicantName}
          isPending={sendMutation.isPending}
          onConfirm={handleSend}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog === 'resend' && (
        <ResendInvitationDialog
          applicantName={applicantName}
          isPending={resendMutation.isPending}
          onConfirm={handleResend}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog === 'revoke' && (
        <RevokeInvitationDialog
          applicantName={applicantName}
          isPending={revokeMutation.isPending}
          onConfirm={handleRevoke}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  );
}
