// Database types for the Family Routine Assistant

export type MemberRole = 'guardian' | 'child';
export type ScheduleType = 'daily' | 'weekdays' | 'date';
export type TaskLogStatus = 'pending' | 'completed' | 'missed';

export interface Family {
  id: string;
  name: string;
  timezone: string;
  created_at: string;
}

export interface Member {
  id: string;
  family_id: string;
  user_id?: string | null;
  name: string;
  role: MemberRole;
  avatar_url?: string | null;
  is_active?: boolean;
  created_at: string;
}

export interface PredefinedTask {
  id: string;
  name: string;
  description?: string | null;
  default_points: number;
}

export interface Task {
  id: string;
  family_id: string;
  predefined_task_id?: string | null;
  name: string;
  description?: string | null;
  points_value: number;
  image_url?: string | null;
  voice_text?: string | null;
  created_at: string;
}

export interface TaskSchedule {
  id: string;
  task_id: string;
  schedule_type: ScheduleType;
  scheduled_time: string; // HH:MM:SS
  weekdays?: number[] | null;
  scheduled_date?: string | null;
  duration_minutes?: number;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  member_id: string;
  is_active: boolean;
  created_at: string;
}

export interface TaskLog {
  id: string;
  assignment_id: string;
  due_date: string; // YYYY-MM-DD
  due_time: string; // HH:MM:SS
  status: TaskLogStatus;
  completed_at?: string | null;
  notes?: string | null;
}

export interface Point {
  id: string;
  member_id: string;
  task_log_id: string;
  points_awarded: number;
  created_at: string;
}

export interface Streak {
  id: string;
  member_id: string;
  task_id: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date?: string | null;
}
