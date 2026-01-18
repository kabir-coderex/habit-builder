// This will be the shape of the data we fetch for the task list
export type ActiveTask = {
  log_id: string;
  due_time: string;
  member_name: string;
  member_avatar_url: string | null;
  task_name: string;
  task_image_url: string | null;
  voice_text?: string | null;
};
