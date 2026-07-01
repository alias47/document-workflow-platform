import { ApplicantProfileContent } from '@/features/applicants/components/ApplicantProfileContent';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ApplicantProfilePage({ params }: Props) {
  const { id } = await params;
  return <ApplicantProfileContent id={id} />;
}
