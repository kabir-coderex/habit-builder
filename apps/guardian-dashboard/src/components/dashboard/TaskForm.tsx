'use client';

import { Task, PredefinedTask } from '@/types/database';
import { useState, useEffect } from 'react';
import styles from './TaskForm.module.scss';

interface TaskFormProps {
  task?: Task | null;
  predefinedTasks: PredefinedTask[];
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

export interface TaskFormData {
  name: string;
  description?: string;
  points_value: number;
  image_url?: string;
  voice_text?: string;
  predefined_task_id?: string | null;
}

export default function TaskForm({ task, predefinedTasks, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    description: '',
    points_value: 10,
    image_url: '',
    voice_text: '',
    predefined_task_id: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        description: task.description || '',
        points_value: task.points_value,
        image_url: task.image_url || '',
        voice_text: task.voice_text || '',
        predefined_task_id: task.predefined_task_id,
      });
    }
  }, [task]);

  const handlePredefinedSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const predefinedId = e.target.value;
    if (!predefinedId) {
      setFormData({
        ...formData,
        predefined_task_id: null,
      });
      return;
    }

    const predefined = predefinedTasks.find(t => t.id === predefinedId);
    if (predefined) {
      setFormData({
        ...formData,
        name: predefined.name,
        description: predefined.description || '',
        points_value: predefined.default_points,
        predefined_task_id: predefinedId,
        voice_text: `Time for ${predefined.name}`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.name.trim()) {
      setError('Task name is required');
      return;
    }

    if (formData.points_value < 0) {
      setError('Points must be a positive number');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>{task ? 'Edit Task' : 'Create New Task'}</h2>
        
        {error && <div className={styles.error}>{error}</div>}

        {!task && (
          <div className={styles.field}>
            <label htmlFor="predefined">Use Predefined Task (Optional)</label>
            <select
              id="predefined"
              value={formData.predefined_task_id || ''}
              onChange={handlePredefinedSelect}
              disabled={isSubmitting}
            >
              <option value="">-- Create Custom Task --</option>
              {predefinedTasks.map(pt => (
                <option key={pt.id} value={pt.id}>
                  {pt.name} ({pt.default_points} points)
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor="name">Task Name *</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={isSubmitting}
            rows={3}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="points">Points Value *</label>
          <input
            id="points"
            type="number"
            min="0"
            value={formData.points_value}
            onChange={(e) => setFormData({ ...formData, points_value: parseInt(e.target.value) || 0 })}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="image_url">Task Image URL (optional)</label>
          <input
            id="image_url"
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            placeholder="https://example.com/task-image.jpg"
            disabled={isSubmitting}
          />
          <small>Provide an image URL for visual representation</small>
        </div>

        <div className={styles.field}>
          <label htmlFor="voice_text">Voice Announcement Text (optional)</label>
          <input
            id="voice_text"
            type="text"
            value={formData.voice_text}
            onChange={(e) => setFormData({ ...formData, voice_text: e.target.value })}
            placeholder="Time for morning prayer"
            disabled={isSubmitting}
          />
          <small>Text that will be spoken when task is announced</small>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={onCancel} disabled={isSubmitting} className={styles.btnCancel}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className={styles.btnSubmit}>
            {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
