'use client';

import { TaskSchedule, Task } from '@/types/database';
import styles from './ScheduleCard.module.scss';

interface ScheduleCardProps {
  schedule: TaskSchedule & { task: Task; assignment_count?: number };
  onEdit: (schedule: TaskSchedule) => void;
  onDelete: (id: string) => void;
}

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ScheduleCard({ schedule, onEdit, onDelete }: ScheduleCardProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getScheduleDescription = () => {
    switch (schedule.schedule_type) {
      case 'daily':
        return 'Every day';
      case 'weekdays':
        return schedule.weekdays?.map(d => WEEKDAY_NAMES[d]).join(', ') || '';
      case 'date':
        return schedule.scheduled_date ? new Date(schedule.scheduled_date).toLocaleDateString() : '';
      default:
        return '';
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this schedule for "${schedule.task.name}"?`)) return;
    await onDelete(schedule.id);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.taskInfo}>
          <h3>{schedule.task.name}</h3>
          <span className={styles.points}>⭐ {schedule.task.points_value} pts</span>
        </div>
        <span className={`${styles.badge} ${styles[schedule.schedule_type]}`}>
          {schedule.schedule_type}
        </span>
      </div>

      <div className={styles.details}>
        <div className={styles.detail}>
          <span className={styles.label}>📅 Schedule:</span>
          <span className={styles.value}>{getScheduleDescription()}</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.label}>🕐 Time:</span>
          <span className={styles.value}>{formatTime(schedule.scheduled_time)}</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.label}>⏱️ Duration:</span>
          <span className={styles.value}>{schedule.duration_minutes} minutes</span>
        </div>
        {schedule.assignment_count !== undefined && (
          <div className={styles.detail}>
            <span className={styles.label}>👥 Assigned to:</span>
            <span className={styles.value}>{schedule.assignment_count} member(s)</span>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button onClick={() => onEdit(schedule)} className={styles.btnEdit}>
          Edit
        </button>
        <button onClick={handleDelete} className={styles.btnDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
