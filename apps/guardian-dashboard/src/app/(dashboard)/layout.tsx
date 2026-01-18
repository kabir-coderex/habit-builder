import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// A server component to handle logout
async function LogoutButton() {
  const logout = async () => {
    'use server';
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect('/login');
  };

  return (
    <form action={logout}>
      <button type="submit">Logout</button>
    </form>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: '200px', borderRight: '1px solid #ccc', padding: '1rem' }}>
        <h3>Menu</h3>
        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          <Link href="/members">Members</Link>
          <Link href="/tasks">Tasks</Link>
          <Link href="/schedules">Schedules</Link>
          <Link href="/analytics">Analytics</Link>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <p>Welcome, {user.email}</p>
          <LogoutButton />
        </div>
      </aside>
      <main style={{ flex: 1, padding: '1rem' }}>
        {children}
      </main>
    </div>
  );
}
