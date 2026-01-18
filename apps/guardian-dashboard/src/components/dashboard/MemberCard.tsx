'use client';

import { Member } from '@/types/database';
import { useState } from 'react';
import styles from './MemberCard.module.scss';

interface MemberCardProps {
  member: Member;
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export default function MemberCard({ member, onEdit, onDelete, onToggleActive }: MemberCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${member.name}?`)) return;
    setIsDeleting(true);
    await onDelete(member.id);
  };

  return (
    <div className={`${styles.card} ${!member.is_active ? styles.inactive : ''}`}>
      <div className={styles.avatar}>
        {member.avatar_url ? (
          <img src={member.avatar_url} alt={member.name} />
        ) : (
          <div className={styles.placeholder}>{member.name.charAt(0).toUpperCase()}</div>
        )}
      </div>
      <div className={styles.info}>
        <h3>{member.name}</h3>
        <span className={styles.role}>{member.role}</span>
        {!member.is_active && <span className={styles.badge}>Inactive</span>}
      </div>
      <div className={styles.actions}>
        <button onClick={() => onEdit(member)} className={styles.btnEdit}>
          Edit
        </button>
        <button 
          onClick={() => onToggleActive(member.id, !member.is_active)}
          className={styles.btnToggle}
        >
          {member.is_active ? 'Deactivate' : 'Activate'}
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
