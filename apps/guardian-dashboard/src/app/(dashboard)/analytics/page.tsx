'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './analytics.module.scss';

interface MemberPoints {
  member_id: string;
  member_name: string;
  avatar_url: string | null;
  total_points: number;
  tasks_completed: number;
  tasks_missed: number;
}

interface MemberStreak {
  member_id: string;
  member_name: string;
  task_name: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
}

interface DailyReport {
  due_date: string;
  member_name: string;
  task_name: string;
  status: string;
  points_earned: number;
}

export default function AnalyticsPage() {
  const [memberPoints, setMemberPoints] = useState<MemberPoints[]>([]);
  const [memberStreaks, setMemberStreaks] = useState<MemberStreak[]>([]);
  const [dailyReport, setDailyReport] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const supabase = createClient();

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Load member points leaderboard
      const { data: pointsData, error: pointsError } = await supabase
        .from('view_member_points')
        .select('*');

      if (pointsError) throw pointsError;
      setMemberPoints(pointsData || []);

      // Load member streaks
      const { data: streaksData, error: streaksError } = await supabase
        .from('view_member_streaks')
        .select('*')
        .order('current_streak', { ascending: false })
        .limit(10);

      if (streaksError) throw streaksError;
      setMemberStreaks(streaksData || []);

      // Load daily report based on selected period
      let query = supabase.from('view_daily_task_report').select('*');
      
      const today = new Date().toISOString().slice(0, 10);
      if (selectedPeriod === 'today') {
        query = query.eq('due_date', today);
      } else if (selectedPeriod === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('due_date', weekAgo.toISOString().slice(0, 10));
      } else if (selectedPeriod === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('due_date', monthAgo.toISOString().slice(0, 10));
      }

      const { data: reportData, error: reportError } = await query.order('due_date', { ascending: false });

      if (reportError) throw reportError;
      setDailyReport(reportData || []);

    } catch (err: any) {
      setError(err.message);
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading analytics...</div>
      </div>
    );
  }

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'missed': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const totalPointsAllMembers = memberPoints.reduce((sum, m) => sum + m.total_points, 0);
  const totalTasksCompleted = memberPoints.reduce((sum, m) => sum + m.tasks_completed, 0);
  const totalTasksMissed = memberPoints.reduce((sum, m) => sum + m.tasks_missed, 0);
  const overallCompletionRate = totalTasksCompleted + totalTasksMissed > 0
    ? Math.round((totalTasksCompleted / (totalTasksCompleted + totalTasksMissed)) * 100)
    : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Analytics & Reports</h1>
        <div className={styles.periodSelector}>
          <button 
            className={selectedPeriod === 'today' ? styles.active : ''}
            onClick={() => setSelectedPeriod('today')}
          >
            Today
          </button>
          <button 
            className={selectedPeriod === 'week' ? styles.active : ''}
            onClick={() => setSelectedPeriod('week')}
          >
            Week
          </button>
          <button 
            className={selectedPeriod === 'month' ? styles.active : ''}
            onClick={() => setSelectedPeriod('month')}
          >
            Month
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Overall Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalPointsAllMembers}</div>
          <div className={styles.statLabel}>Total Points</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalTasksCompleted}</div>
          <div className={styles.statLabel}>Tasks Completed</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalTasksMissed}</div>
          <div className={styles.statLabel}>Tasks Missed</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{overallCompletionRate}%</div>
          <div className={styles.statLabel}>Completion Rate</div>
        </div>
      </div>

      {/* Member Leaderboard */}
      <section className={styles.section}>
        <h2>🏆 Member Leaderboard</h2>
        {memberPoints.length === 0 ? (
          <p className={styles.empty}>No data yet. Complete some tasks to see the leaderboard!</p>
        ) : (
          <div className={styles.leaderboard}>
            {memberPoints.map((member, index) => (
              <div key={member.member_id} className={styles.leaderboardItem}>
                <div className={styles.rank}>{index + 1}</div>
                <div className={styles.memberInfo}>
                  {member.avatar_url && (
                    <img src={member.avatar_url} alt={member.member_name} className={styles.avatar} />
                  )}
                  <div>
                    <div className={styles.memberName}>{member.member_name}</div>
                    <div className={styles.memberStats}>
                      ✅ {member.tasks_completed} | ❌ {member.tasks_missed}
                    </div>
                  </div>
                </div>
                <div className={styles.points}>⭐ {member.total_points}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Top Streaks */}
      <section className={styles.section}>
        <h2>🔥 Top Streaks</h2>
        {memberStreaks.length === 0 ? (
          <p className={styles.empty}>No streaks yet. Complete tasks consistently to build streaks!</p>
        ) : (
          <div className={styles.streakGrid}>
            {memberStreaks.slice(0, 6).map((streak) => (
              <div key={`${streak.member_id}-${streak.task_name}`} className={styles.streakCard}>
                <div className={styles.streakValue}>{streak.current_streak} 🔥</div>
                <div className={styles.streakTask}>{streak.task_name}</div>
                <div className={styles.streakMember}>{streak.member_name}</div>
                <div className={styles.streakBest}>Best: {streak.longest_streak}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section className={styles.section}>
        <h2>📊 Recent Activity</h2>
        {dailyReport.length === 0 ? (
          <p className={styles.empty}>No activity for this period.</p>
        ) : (
          <div className={styles.reportTable}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Member</th>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {dailyReport.slice(0, 20).map((item, index) => (
                  <tr key={index}>
                    <td>{new Date(item.due_date).toLocaleDateString()}</td>
                    <td>{item.member_name}</td>
                    <td>{item.task_name}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[item.status]}`}>
                        {getStatusEmoji(item.status)} {item.status}
                      </span>
                    </td>
                    <td className={styles.pointsCell}>{item.points_earned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
