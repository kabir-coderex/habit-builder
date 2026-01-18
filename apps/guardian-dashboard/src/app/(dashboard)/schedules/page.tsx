'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import { Task, Member, TaskSchedule } from '@/types/database';
import ScheduleCard from '@/components/dashboard/ScheduleCard';
import ScheduleForm, { ScheduleFormData } from '@/components/dashboard/ScheduleForm';
import styles from './schedules.module.scss';

type ScheduleWithTask = TaskSchedule & { task: Task; assignment_count?: number };

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<ScheduleWithTask[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TaskSchedule | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const searchParams = useSearchParams();
  const initialTaskId = searchParams.get('task_id');

  useEffect(() => {
    loadData();
    if (initialTaskId) {
      setShowForm(true);
    }
  }, [initialTaskId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load tasks, members, and schedules in parallel
      const [tasksResult, membersResult, schedulesResult] = await Promise.all([
        supabase.from('tasks').select('*').order('name'),
        supabase.from('members').select('*').order('name'),
        supabase
          .from('task_schedules')
          .select(`
            *,
            task:tasks (*)
          `)
          .order('scheduled_time'),
      ]);

      if (tasksResult.error) throw tasksResult.error;
      if (membersResult.error) throw membersResult.error;
      if (schedulesResult.error) throw schedulesResult.error;

      setTasks(tasksResult.data || []);
      setMembers(membersResult.data || []);

      // Get assignment counts for each schedule
      const schedulesWithCounts = await Promise.all(
        (schedulesResult.data || []).map(async (schedule: any) => {
          const { count } = await supabase
            .from('task_assignments')
            .select('*', { count: 'exact', head: true })
            .eq('task_id', schedule.task_id);
          
          return {
            ...schedule,
            assignment_count: count || 0,
          };
        })
      );

      setSchedules(schedulesWithCounts);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: ScheduleFormData) => {
    try {
      // Create schedule
      const { data: newSchedule, error: scheduleError } = await supabase
        .from('task_schedules')
        .insert({
          task_id: formData.task_id,
          schedule_type: formData.schedule_type,
          scheduled_time: `${formData.scheduled_time}:00`,
          duration_minutes: formData.duration_minutes,
          weekdays: formData.schedule_type === 'weekdays' ? formData.weekdays : null,
          scheduled_date: formData.schedule_type === 'date' ? formData.scheduled_date : null,
        })
        .select()
        .single();

      if (scheduleError) throw scheduleError;

      // Create assignments for selected members
      if (formData.member_ids.length > 0) {
        // First, delete existing assignments for this task
        await supabase
          .from('task_assignments')
          .delete()
          .eq('task_id', formData.task_id);

        // Create new assignments
        const assignments = formData.member_ids.map(member_id => ({
          task_id: formData.task_id,
          member_id,
          is_active: true,
        }));

        const { error: assignmentError } = await supabase
          .from('task_assignments')
          .insert(assignments);

        if (assignmentError) throw assignmentError;
      }

      await loadData();
      setShowForm(false);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create schedule');
    }
  };

  const handleUpdate = async (formData: ScheduleFormData) => {
    if (!editingSchedule) return;

    try {
      const { error: scheduleError } = await supabase
        .from('task_schedules')
        .update({
          schedule_type: formData.schedule_type,
          scheduled_time: `${formData.scheduled_time}:00`,
          duration_minutes: formData.duration_minutes,
          weekdays: formData.schedule_type === 'weekdays' ? formData.weekdays : null,
          scheduled_date: formData.schedule_type === 'date' ? formData.scheduled_date : null,
        })
        .eq('id', editingSchedule.id);

      if (scheduleError) throw scheduleError;

      // Update assignments
      if (formData.member_ids.length > 0) {
        await supabase
          .from('task_assignments')
          .delete()
          .eq('task_id', formData.task_id);

        const assignments = formData.member_ids.map(member_id => ({
          task_id: formData.task_id,
          member_id,
          is_active: true,
        }));

        const { error: assignmentError } = await supabase
          .from('task_assignments')
          .insert(assignments);

        if (assignmentError) throw assignmentError;
      }

      await loadData();
      setEditingSchedule(null);
      setShowForm(false);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update schedule');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('task_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete schedule');
    }
  };

  const handleEdit = (schedule: TaskSchedule) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingSchedule(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingSchedule(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading schedules...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Task Schedules</h1>
        <button onClick={handleAddNew} className={styles.btnAdd}>
          + Create Schedule
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {tasks.length === 0 && (
        <div className={styles.notice}>
          <p>⚠️ No tasks found. Please create tasks first before scheduling.</p>
        </div>
      )}

      {members.filter(m => m.is_active).length === 0 && (
        <div className={styles.notice}>
          <p>⚠️ No active members found. Please add members first.</p>
        </div>
      )}

      {schedules.length === 0 ? (
        <div className={styles.empty}>
          <p>No schedules created yet.</p>
          <p>Create schedules to assign tasks to family members at specific times.</p>
          {tasks.length > 0 && (
            <button onClick={handleAddNew} className={styles.btnAdd}>
              Create Your First Schedule
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {schedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ScheduleForm
          tasks={tasks}
          members={members}
          schedule={editingSchedule}
          initialTaskId={initialTaskId || undefined}
          onSubmit={editingSchedule ? handleUpdate : handleCreate}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
