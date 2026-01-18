'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Member } from '@/types/database';
import MemberCard from '@/components/dashboard/MemberCard';
import MemberForm, { MemberFormData } from '@/components/dashboard/MemberForm';
import styles from './members.module.scss';

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: MemberFormData) => {
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
        .from('members')
        .insert({
          family_id: currentMember.family_id,
          name: formData.name,
          role: formData.role,
          avatar_url: formData.avatar_url || null,
          is_active: formData.is_active,
        });

      if (error) throw error;

      await loadMembers();
      setShowForm(false);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create member');
    }
  };

  const handleUpdate = async (formData: MemberFormData) => {
    if (!editingMember) return;

    try {
      const { error } = await supabase
        .from('members')
        .update({
          name: formData.name,
          role: formData.role,
          avatar_url: formData.avatar_url || null,
          is_active: formData.is_active,
        })
        .eq('id', editingMember.id);

      if (error) throw error;

      await loadMembers();
      setEditingMember(null);
      setShowForm(false);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update member');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadMembers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete member');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('members')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      await loadMembers();
    } catch (err: any) {
      alert(err.message || 'Failed to update member status');
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingMember(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading members...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Family Members</h1>
        <button onClick={handleAddNew} className={styles.btnAdd}>
          + Add Member
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {members.length === 0 ? (
        <div className={styles.empty}>
          <p>No family members yet.</p>
          <button onClick={handleAddNew} className={styles.btnAdd}>
            Add Your First Member
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {showForm && (
        <MemberForm
          member={editingMember}
          onSubmit={editingMember ? handleUpdate : handleCreate}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
