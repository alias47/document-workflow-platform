'use client';

import { useRouter } from 'next/navigation';

import { useApplicantLogout, useApplicantMe } from '../hooks/use-applicant-portal';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export function ApplicantHeader() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: me } = useApplicantMe();
  const logout = useApplicantLogout();

  async function handleLogout() {
    try {
      await logout.mutateAsync();
      router.push('/applicant/login');
    } catch {
      toast({ type: 'error', title: 'Logout failed' });
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        {me && (
          <span className="text-sm text-gray-600">
            {me.firstName} {me.lastName}
          </span>
        )}
        <Button variant="secondary" size="sm" onClick={() => void handleLogout()}>
          Logout
        </Button>
      </div>
    </header>
  );
}
