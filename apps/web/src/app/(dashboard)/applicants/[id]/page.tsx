import { ApplicantProfileClient } from '@/features/applicants/components/ApplicantProfileClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApplicantProfilePage({ params }: Props) {
  const { id } = await params;
  return <ApplicantProfileClient id={id} />;
}
