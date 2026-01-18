'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './dashboard.module.scss';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      } else {
        setUser(user);
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <h2>🏠 Family Routine</h2>
        </div>
        <nav className={styles.nav}>
          <Link 
            href="/members" 
            className={pathname?.includes('/members') ? styles.active : ''}
          >
            <span className={styles.icon}>👥</span>
            <span>Members</span>
          </Link>
          <Link 
            href="/tasks" 
            className={pathname?.includes('/tasks') ? styles.active : ''}
          >
            <span className={styles.icon}>📝</span>
            <span>Tasks</span>
          </Link>
          <Link 
            href="/schedules" 
            className={pathname?.includes('/schedules') ? styles.active : ''}
          >
            <span className={styles.icon}>📅</span>
            <span>Schedules</span>
          </Link>
          <Link 
            href="/analytics" 
            className={pathname?.includes('/analytics') ? styles.active : ''}
          >
            <span className={styles.icon}>📊</span>
            <span>Analytics</span>
          </Link>
        </nav>
        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <div className={styles.userName}>
              {user?.email?.split('@')[0]}
            </div>
            <div className={styles.userEmail}>{user?.email}</div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            🚪 Logout
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
