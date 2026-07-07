'use client';

import { useState } from 'react';

import { useApplicantProfile, useUpdateApplicantProfile } from '../hooks/use-applicant-portal';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ApplicantProfileCard() {
  const { data: profile, isLoading } = useApplicantProfile();
  const update = useUpdateApplicantProfile();
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  function startEdit() {
    setPhone(profile?.phone ?? '');
    setAddress(profile?.address ?? '');
    setCity(profile?.city ?? '');
    setCountry(profile?.country ?? '');
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await update.mutateAsync({ phone, address, city, country });
    setEditing(false);
  }

  if (isLoading || !profile) {
    return <div className="h-48 animate-pulse rounded-lg bg-gray-100" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile</CardTitle>
        {!editing && profile.portalAllowProfileEdit !== false && (
          <Button variant="secondary" size="sm" onClick={startEdit}>
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <form onSubmit={(e) => void handleSave(e)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Country</Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Address</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>City</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? 'Saving…' : 'Save'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium">
                {profile.firstName} {profile.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium">{profile.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium">{profile.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Applicant #</dt>
              <dd className="font-medium">{profile.applicantNumber}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Address</dt>
              <dd className="font-medium">{profile.address ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">City / Country</dt>
              <dd className="font-medium">
                {[profile.city, profile.country].filter(Boolean).join(', ') || '—'}
              </dd>
            </div>
            {profile.assignedConsultant && (
              <div className="col-span-2">
                <dt className="text-gray-500">Assigned Consultant</dt>
                <dd className="font-medium">
                  {profile.assignedConsultant.firstName} {profile.assignedConsultant.lastName}
                </dd>
              </div>
            )}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
