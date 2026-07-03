import { ApplicantProfileCard } from '@/features/applicant-portal';

export default function ApplicantProfilePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <ApplicantProfileCard />
    </div>
  );
}
