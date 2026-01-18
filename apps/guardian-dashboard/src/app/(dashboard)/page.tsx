import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // The main dashboard page redirects to the members page by default.
  redirect('/members');
}
