'use client';

import { ActiveTask } from '@/types';
import TaskRow from './TaskRow';
import { useState, useEffect } from 'react';
import { speak } from '@/lib/tts';

const ANNOUNCED_TASKS_KEY = 'announced_task_logs';

function getAnnouncedTasks(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  const stored = sessionStorage.getItem(ANNOUNCED_TASKS_KEY);
  return stored ? new Set(JSON.parse(stored)) : new Set();
}

function setAnnouncedTask(log_id: string) {
  const announced = getAnnouncedTasks();
  announced.add(log_id);
  sessionStorage.setItem(ANNOUNCED_TASKS_KEY, JSON.stringify(Array.from(announced)));
}

export default function TaskList({ tasks: initialTasks }: { tasks: ActiveTask[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [audioAllowed, setAudioAllowed] = useState(false);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    if (!audioAllowed || tasks.length === 0) return;

    const announced = getAnnouncedTasks();
    tasks.forEach(task => {
      if (!announced.has(task.log_id)) {
        // Use custom voice text if available, otherwise use default
        const announcementText = task.voice_text || `Time for ${task.task_name} for ${task.member_name}.`;
        console.log(`Announcing: ${announcementText}`);
        speak(announcementText, 'en-US').catch(err => console.error(err));
        setAnnouncedTask(task.log_id);
      }
    });
  }, [tasks, audioAllowed]);

  const handleTaskCompleted = (log_id: string) => {
    setTasks(currentTasks => currentTasks.filter(task => task.log_id !== log_id));
  };

  if (!audioAllowed) {
    return (
      <div style={{ textAlign: 'center', marginTop: '5rem' }}>
        <button 
          onClick={() => setAudioAllowed(true)}
          style={{ padding: '1rem 2rem', fontSize: '1.2rem', cursor: 'pointer' }}
        >
          Enable Sound
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return <p style={{ textAlign: 'center', marginTop: '2rem' }}>All tasks completed for today!</p>;
  }

  return (
    <div>
      {tasks.map(task => (
        <TaskRow key={task.log_id} task={task} onTaskCompleted={handleTaskCompleted} />
      ))}
    </div>
  );
}
