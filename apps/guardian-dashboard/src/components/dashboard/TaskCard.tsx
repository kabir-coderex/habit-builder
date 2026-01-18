'use client';

import { Task } from '@/types/database';
import { useState } from 'react';
import styles from './TaskCard.module.scss';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onSchedule: (task: Task) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onSchedule }: TaskCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${task.name}"?`)) return;
    setIsDeleting(true);
    await onDelete(task.id);
  };

  return (
    <div className={styles.card}>
      {task.image_url && (
        <div className={styles.image}>
          <img src={task.image_url} alt={task.name} />
        </div>
      )}
      <div className={styles.content}>
        <h3>{task.name}</h3>
        {task.description && <p className={styles.description}>{task.description}</p>}
        <div className={styles.meta}>
          <span className={styles.points}>⭐ {task.points_value} points</span>
          {task.voice_text && (
            <span className={styles.voice} title={task.voice_text}>
              🔊 Voice enabled
            </span>
          )}
        </div>
      </div>
      <div className={styles.actions}>
        <button onClick={() => onSchedule(task)} className={styles.btnSchedule}>
          Schedule
        </button>
        <button onClick={() => onEdit(task)} className={styles.btnEdit}>
          Edit
        </button>
        <button 
          onClick={handleDelete} 
          className={styles.btnDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
