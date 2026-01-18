'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import TaskList from '@/components/TaskList';
import { ActiveTask } from '@/types';

export default function HomePage() {
  const [tasks, setTasks] = useState<ActiveTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveTasks = async () => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const { data, error } = await supabase
      .from('task_logs')
      .select(`
        id,
        due_time,
        assignment:task_assignments (
          member:members (
            name,
            avatar_url
          ),
          task:tasks (
            name,
            image_url,
            voice_text
          )
        )
      `)
      .eq('due_date', today)
      .eq('status', 'pending')
      .order('due_time');

    if (error) {
      console.error('Error fetching active tasks:', error);
      return [];
    }

    // Transform the data into the desired shape
    return data.map((log: any) => ({
      log_id: log.id,
      due_time: new Date(`1970-01-01T${log.due_time}`).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      }),
      member_name: log.assignment.member.name,
      member_avatar_url: log.assignment.member.avatar_url,
      task_name: log.assignment.task.name,
      task_image_url: log.assignment.task.image_url,
      voice_text: log.assignment.task.voice_text,
    }));
  };

  const loadTasks = async () => {
    setLoading(true);
    const fetchedTasks = await fetchActiveTasks();
    setTasks(fetchedTasks);
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();

    // Poll for new tasks every 30 seconds
    const pollInterval = setInterval(() => {
      loadTasks();
    }, 30000);

    // Set up realtime subscription for task_logs changes
    const subscription = supabase
      .channel('task_logs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task_logs' },
        () => {
          loadTasks();
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <main>
        <header style={{ 
          background: '#fff', 
          padding: '1rem', 
          textAlign: 'center', 
          borderBottom: '1px solid #ddd',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ margin: 0, color: '#333', fontSize: '1.5rem' }}>Today's Routines</h1>
        </header>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          Loading tasks...
        </div>
      </main>
    );
  }

  return (
    <main>
      <header style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '1.5rem', 
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <h1 style={{ margin: 0, color: 'white', fontSize: '1.75rem', fontWeight: '600' }}>
          Today's Routines
        </h1>
        <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '0.875rem' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>
      <TaskList tasks={tasks} />
    </main>
  );
}

