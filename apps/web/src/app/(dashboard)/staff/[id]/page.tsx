import { StaffProfileClient } from '@/features/staff/components/StaffProfileClient';

export const metadata = { title: 'Staff Profile | Document Workflow' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StaffProfilePage({ params }: Props) {
  const { id } = await params;
  return <StaffProfileClient staffId={id} />;
}
