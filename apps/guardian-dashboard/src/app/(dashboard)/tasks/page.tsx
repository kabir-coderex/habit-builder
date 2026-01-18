'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Task, PredefinedTask } from '@/types/database';
import TaskCard from '@/components/dashboard/TaskCard';
import TaskForm, { TaskFormData } from '@/components/dashboard/TaskForm';
import { useRouter } from 'next/navigation';
import styles from './tasks.module.scss';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [predefinedTasks, setPredefinedTasks] = useState<PredefinedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load predefined tasks
      const { data: predefined, error: predefinedError } = await supabase
        .from('predefined_tasks')
        .select('*')
        .order('name');
      
      if (predefinedError) throw predefinedError;
      setPredefinedTasks(predefined || []);

      // Load family tasks
      const { data: familyTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;
      setTasks(familyTasks || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: TaskFormData) => {
    try {
      // Get current user's family_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: currentMember } = await supabase
        .from('members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (!currentMember) throw new Error('No family found');

      const { error } = await supabase
        .from('tasks')
        .insert({
          family_id: currentMember.family_id,
          name: formData.name,
          description: formData.description || null,
          points_value: formData.points_value,
          image_url: formData.image_url || null,
          voice_text: formData.voice_text || null,
          predefined_task_id: formData.predefined_task_id || null,
        });

      if (error) throw error;

      await loadData();
      setShowForm(false);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create task');
    }
  };

  const handleUpdate = async (formData: TaskFormData) => {
    if (!editingTask) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          name: formData.name,
          description: formData.description || null,
          points_value: formData.points_value,
          image_url: formData.image_url || null,
          voice_text: formData.voice_text || null,
        })
        .eq('id', editingTask.id);

      if (error) throw error;

      await loadData();
      setEditingTask(null);
      setShowForm(false);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update task');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete task');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleSchedule = (task: Task) => {
    // Navigate to schedules page with the task ID
    router.push(`/schedules?task_id=${task.id}`);
  };

  const handleAddNew = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingTask(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Tasks</h1>
        <button onClick={handleAddNew} className={styles.btnAdd}>
          + Create Task
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {tasks.length === 0 ? (
        <div className={styles.empty}>
          <p>No tasks created yet.</p>
          <p>Create tasks to assign to family members.</p>
          <button onClick={handleAddNew} className={styles.btnAdd}>
            Create Your First Task
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSchedule={handleSchedule}
            />
          ))}
        </div>
      )}

      {showForm && (
        <TaskForm
          task={editingTask}
          predefinedTasks={predefinedTasks}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
