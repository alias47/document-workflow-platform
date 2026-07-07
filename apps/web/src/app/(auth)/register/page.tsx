import { redirect } from 'next/navigation';

// Self-registration is not supported. Applicants are created by staff and
// receive an invitation email. Staff accounts are provisioned by admins.
export default function RegisterPage() {
  redirect('/login');
}
