'use client';

import { ActiveTask } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { useState } from 'react';

export default function TaskRow({ task, onTaskCompleted }: { task: ActiveTask, onTaskCompleted: (log_id: string) => void }) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDone = async () => {
    setIsCompleting(true);
    setError(null);

    const { error } = await supabase
      .from('task_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', task.log_id);

    if (error) {
      setError('Failed to update task. Please try again.');
      setIsCompleting(false);
      console.error(error);
    } else {
      // Notify parent component to remove this task from the list
      onTaskCompleted(task.log_id);
    }
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    background: '#fff',
    borderBottom: '1px solid #eee',
    gap: '1rem',
    opacity: isCompleting ? 0.5 : 1,
  };

  const avatarStyle: React.CSSProperties = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#ccc',
    objectFit: 'cover',
  };

  const taskImageStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
  };

  const taskNameStyle: React.CSSProperties = {
    flexGrow: 1,
    fontWeight: 'bold',
  };

  const doneButtonStyle: React.CSSProperties = {
    padding: '0.8rem 1.5rem',
    border: 'none',
    borderRadius: '8px',
    background: '#22C55E', // green-500
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  };

  return (
    <div style={rowStyle}>
      <img src={task.member_avatar_url || '/icons/icon-192x192.png'} alt={task.member_name} style={avatarStyle} />
      <img src={task.task_image_url || '/icons/icon-192x192.png'} alt={task.task_name} style={taskImageStyle} />
      <div style={taskNameStyle}>
        <div>{task.task_name}</div>
        <div style={{ fontSize: '0.8rem', color: '#666' }}>{task.member_name} - {task.due_time}</div>
      </div>
      <button onClick={handleDone} disabled={isCompleting} style={doneButtonStyle}>
        {isCompleting ? '...' : 'DONE'}
      </button>
      {error && <p style={{ color: 'red', fontSize: '0.8rem' }}>{error}</p>}
    </div>
  );
}
