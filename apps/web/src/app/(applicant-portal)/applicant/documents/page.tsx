import { ApplicantDocumentList } from '@/features/applicant-portal';

export default function ApplicantDocumentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Documents</h1>
      <ApplicantDocumentList />
    </div>
  );
}
