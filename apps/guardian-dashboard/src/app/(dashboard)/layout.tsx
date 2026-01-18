import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import '../../styles/dashboard.css';

async function LogoutButton() {
  const logout = async () => {
    'use server';
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect('/login');
  };
  return (
    <form action={logout}>
      <button type="submit" style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:8,padding:'0.5rem 1.2rem',fontWeight:600,cursor:'pointer'}}>Logout</button>
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
  // Get current path for active nav
  let currentPath = '';
  if (typeof window !== 'undefined') {
    currentPath = window.location.pathname;
  }
  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <h3>Family Routine</h3>
        <nav>
          <Link href="/members" className={currentPath.includes('/members') ? 'active' : ''}>Members</Link>
          <Link href="/tasks" className={currentPath.includes('/tasks') ? 'active' : ''}>Tasks</Link>
          <Link href="/schedules" className={currentPath.includes('/schedules') ? 'active' : ''}>Schedules</Link>
          <Link href="/analytics" className={currentPath.includes('/analytics') ? 'active' : ''}>Analytics</Link>
        </nav>
        <div className="sidebar-footer">
          <p>Welcome, {user.email}</p>
          <LogoutButton />
        </div>
      </aside>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
