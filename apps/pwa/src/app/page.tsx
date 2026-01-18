import { createClient } from '@supabase/supabase-js';
import TaskList from '@/components/TaskList';
import { ActiveTask } from '@/types';
import { cookies } from 'next/headers'; // This is needed for createServerClient, even if simple

// For server-side rendering in Next.js, even for anon access,
// it's good practice to use a pattern that can be adapted.
// We will create a simple client here.
const createServerSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

async function getActiveTasks(): Promise<ActiveTask[]> {
  const supabase = createServerSupabaseClient();
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
          name
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
    due_time: new Date(`1970-01-01T${log.due_time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit'}),
    member_name: log.assignment.member.name,
    member_avatar_url: log.assignment.member.avatar_url,
    task_name: log.assignment.task.name,
    task_image_url: null, // Placeholder for task image
  }));
}

export default async function HomePage() {
  const tasks = await getActiveTasks();

  return (
    <main>
      <header style={{ background: '#fff', padding: '1rem', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
        <h1>Today's Routines</h1>
      </header>
      <TaskList tasks={tasks} />
    </main>
  );
}
