'use client';

import { Member } from '@/types/database';
import { useState, useEffect } from 'react';
import styles from './MemberForm.module.scss';

interface MemberFormProps {
  member?: Member | null;
  onSubmit: (data: MemberFormData) => Promise<void>;
  onCancel: () => void;
}

export interface MemberFormData {
  name: string;
  role: 'guardian' | 'child';
  avatar_url?: string;
  is_active: boolean;
}

export default function MemberForm({ member, onSubmit, onCancel }: MemberFormProps) {
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    role: 'child',
    avatar_url: '',
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        role: member.role,
        avatar_url: member.avatar_url || '',
        is_active: member.is_active ?? true,
      });
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>{member ? 'Edit Member' : 'Add New Member'}</h2>
        
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label htmlFor="name">Name *</label>
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
          <label htmlFor="role">Role *</label>
          <select
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'guardian' | 'child' })}
            disabled={isSubmitting}
          >
            <option value="child">Child</option>
            <option value="guardian">Guardian</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="avatar_url">Avatar URL (optional)</label>
          <input
            id="avatar_url"
            type="url"
            value={formData.avatar_url}
            onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
            placeholder="https://example.com/avatar.jpg"
            disabled={isSubmitting}
          />
          <small>Provide an image URL or upload to Supabase storage</small>
        </div>

        <div className={styles.field}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              disabled={isSubmitting}
            />
            <span>Active</span>
          </label>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={onCancel} disabled={isSubmitting} className={styles.btnCancel}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className={styles.btnSubmit}>
            {isSubmitting ? 'Saving...' : member ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
