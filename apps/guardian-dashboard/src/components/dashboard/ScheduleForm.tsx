'use client';

import { Task, Member, TaskSchedule, ScheduleType } from '@/types/database';
import { useState, useEffect } from 'react';
import styles from './ScheduleForm.module.scss';

interface ScheduleFormProps {
  tasks: Task[];
  members: Member[];
  schedule?: TaskSchedule | null;
  initialTaskId?: string;
  onSubmit: (data: ScheduleFormData) => Promise<void>;
  onCancel: () => void;
}

export interface ScheduleFormData {
  task_id: string;
  schedule_type: ScheduleType;
  scheduled_time: string; // HH:MM
  duration_minutes: number;
  weekdays?: number[];
  scheduled_date?: string;
  member_ids: string[];
}

const WEEKDAY_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function ScheduleForm({ tasks, members, schedule, initialTaskId, onSubmit, onCancel }: ScheduleFormProps) {
  const [formData, setFormData] = useState<ScheduleFormData>({
    task_id: initialTaskId || '',
    schedule_type: 'daily',
    scheduled_time: '08:00',
    duration_minutes: 60,
    weekdays: [1, 2, 3, 4, 5], // Mon-Fri by default
    scheduled_date: '',
    member_ids: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignToAll, setAssignToAll] = useState(true);

  useEffect(() => {
    if (schedule) {
      // Editing mode - we'll need to fetch assignments
      setFormData({
        task_id: schedule.task_id,
        schedule_type: schedule.schedule_type,
        scheduled_time: schedule.scheduled_time.slice(0, 5), // HH:MM:SS -> HH:MM
        duration_minutes: schedule.duration_minutes || 60,
        weekdays: schedule.weekdays || [1, 2, 3, 4, 5],
        scheduled_date: schedule.scheduled_date || '',
        member_ids: [],
      });
    }
  }, [schedule]);

  const handleWeekdayToggle = (day: number) => {
    const current = formData.weekdays || [];
    if (current.includes(day)) {
      setFormData({ ...formData, weekdays: current.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, weekdays: [...current, day].sort() });
    }
  };

  const handleMemberToggle = (memberId: string) => {
    const current = formData.member_ids;
    if (current.includes(memberId)) {
      setFormData({ ...formData, member_ids: current.filter(id => id !== memberId) });
    } else {
      setFormData({ ...formData, member_ids: [...current, memberId] });
    }
  };

  const handleAssignToAllToggle = () => {
    setAssignToAll(!assignToAll);
    if (!assignToAll) {
      setFormData({ ...formData, member_ids: members.filter(m => m.is_active).map(m => m.id) });
    } else {
      setFormData({ ...formData, member_ids: [] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.task_id) {
      setError('Please select a task');
      return;
    }

    if (!assignToAll && formData.member_ids.length === 0) {
      setError('Please select at least one member or assign to all');
      return;
    }

    if (formData.schedule_type === 'weekdays' && (!formData.weekdays || formData.weekdays.length === 0)) {
      setError('Please select at least one weekday');
      return;
    }

    if (formData.schedule_type === 'date' && !formData.scheduled_date) {
      setError('Please select a date');
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        member_ids: assignToAll ? members.filter(m => m.is_active).map(m => m.id) : formData.member_ids,
      };
      await onSubmit(submitData);
    } catch (err: any) {
      setError(err.message || 'Failed to save schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>{schedule ? 'Edit Schedule' : 'Create New Schedule'}</h2>
        
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label htmlFor="task_id">Task *</label>
          <select
            id="task_id"
            value={formData.task_id}
            onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}
            required
            disabled={isSubmitting || !!initialTaskId}
          >
            <option value="">-- Select a task --</option>
            {tasks.map(task => (
              <option key={task.id} value={task.id}>
                {task.name} ({task.points_value} points)
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="schedule_type">Schedule Type *</label>
          <select
            id="schedule_type"
            value={formData.schedule_type}
            onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value as ScheduleType })}
            disabled={isSubmitting}
          >
            <option value="daily">Daily</option>
            <option value="weekdays">Specific Weekdays</option>
            <option value="date">Specific Date</option>
          </select>
        </div>

        {formData.schedule_type === 'weekdays' && (
          <div className={styles.field}>
            <label>Select Weekdays *</label>
            <div className={styles.weekdayGrid}>
              {WEEKDAY_OPTIONS.map(day => (
                <label key={day.value} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.weekdays?.includes(day.value) || false}
                    onChange={() => handleWeekdayToggle(day.value)}
                    disabled={isSubmitting}
                  />
                  <span>{day.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {formData.schedule_type === 'date' && (
          <div className={styles.field}>
            <label htmlFor="scheduled_date">Date *</label>
            <input
              id="scheduled_date"
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>
        )}

        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="scheduled_time">Time *</label>
            <input
              id="scheduled_time"
              type="time"
              value={formData.scheduled_time}
              onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="duration">Duration (minutes) *</label>
            <input
              id="duration"
              type="number"
              min="1"
              max="1440"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={assignToAll}
              onChange={handleAssignToAllToggle}
              disabled={isSubmitting}
            />
            <span>Assign to all active members</span>
          </label>
        </div>

        {!assignToAll && (
          <div className={styles.field}>
            <label>Select Members *</label>
            <div className={styles.memberGrid}>
              {members.filter(m => m.is_active).map(member => (
                <label key={member.id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.member_ids.includes(member.id)}
                    onChange={() => handleMemberToggle(member.id)}
                    disabled={isSubmitting}
                  />
                  <span>{member.name}</span>
                </label>
              ))}
            </div>
            {members.filter(m => m.is_active).length === 0 && (
              <small className={styles.warning}>No active members found</small>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <button type="button" onClick={onCancel} disabled={isSubmitting} className={styles.btnCancel}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className={styles.btnSubmit}>
            {isSubmitting ? 'Saving...' : schedule ? 'Update Schedule' : 'Create Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
}
