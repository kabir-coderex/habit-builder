// This will be the shape of the data we fetch for the task list
export type ActiveTask = {
  log_id: string;
  due_time: string;
  member_name: string;
  member_avatar_url: string | null;
  task_name: string;
  // The schema doesn't currently support task images, but we add it here
  // for future implementation. We will use a placeholder for now.
  task_image_url: string | null;
};
