-- Migration for analytics views and materialized views

-- View: Member Points Leaderboard
CREATE OR REPLACE VIEW public.view_member_points AS
SELECT 
  m.id AS member_id,
  m.name AS member_name,
  m.avatar_url,
  m.role,
  COALESCE(SUM(p.points_awarded), 0) AS total_points,
  COUNT(DISTINCT tl.id) FILTER (WHERE tl.status = 'completed') AS tasks_completed,
  COUNT(DISTINCT tl.id) FILTER (WHERE tl.status = 'missed') AS tasks_missed
FROM public.members m
LEFT JOIN public.points p ON p.member_id = m.id
LEFT JOIN public.task_logs tl ON tl.id = p.task_log_id
WHERE m.is_active = true
GROUP BY m.id, m.name, m.avatar_url, m.role
ORDER BY total_points DESC;

COMMENT ON VIEW public.view_member_points IS 'Leaderboard showing total points, completed and missed tasks per member';

-- View: Member Streaks Summary
CREATE OR REPLACE VIEW public.view_member_streaks AS
SELECT 
  m.id AS member_id,
  m.name AS member_name,
  t.name AS task_name,
  s.current_streak,
  s.longest_streak,
  s.last_completed_date
FROM public.streaks s
JOIN public.members m ON m.id = s.member_id
JOIN public.tasks t ON t.id = s.task_id
WHERE m.is_active = true
ORDER BY s.current_streak DESC, s.longest_streak DESC;

COMMENT ON VIEW public.view_member_streaks IS 'Shows current and longest streaks for each member and task';

-- View: Daily Task Completion Report
CREATE OR REPLACE VIEW public.view_daily_task_report AS
SELECT 
  tl.due_date,
  m.id AS member_id,
  m.name AS member_name,
  t.name AS task_name,
  tl.status,
  tl.completed_at,
  t.points_value,
  CASE 
    WHEN tl.status = 'completed' THEN p.points_awarded
    ELSE 0
  END AS points_earned
FROM public.task_logs tl
JOIN public.task_assignments ta ON ta.id = tl.assignment_id
JOIN public.members m ON m.id = ta.member_id
JOIN public.tasks t ON t.id = ta.task_id
LEFT JOIN public.points p ON p.task_log_id = tl.id
ORDER BY tl.due_date DESC, m.name, tl.due_time;

COMMENT ON VIEW public.view_daily_task_report IS 'Daily breakdown of task completion status and points earned';

-- View: Weekly Summary
CREATE OR REPLACE VIEW public.view_weekly_summary AS
SELECT 
  DATE_TRUNC('week', tl.due_date)::date AS week_start,
  m.id AS member_id,
  m.name AS member_name,
  COUNT(*) FILTER (WHERE tl.status = 'completed') AS tasks_completed,
  COUNT(*) FILTER (WHERE tl.status = 'missed') AS tasks_missed,
  COUNT(*) FILTER (WHERE tl.status = 'pending') AS tasks_pending,
  COALESCE(SUM(p.points_awarded), 0) AS total_points,
  ROUND(
    COUNT(*) FILTER (WHERE tl.status = 'completed')::numeric / 
    NULLIF(COUNT(*) FILTER (WHERE tl.status IN ('completed', 'missed'))::numeric, 0) * 100,
    2
  ) AS completion_rate
FROM public.task_logs tl
JOIN public.task_assignments ta ON ta.id = tl.assignment_id
JOIN public.members m ON m.id = ta.member_id
LEFT JOIN public.points p ON p.task_log_id = tl.id
WHERE m.is_active = true
GROUP BY week_start, m.id, m.name
ORDER BY week_start DESC, total_points DESC;

COMMENT ON VIEW public.view_weekly_summary IS 'Weekly aggregated statistics per member';

-- View: Monthly Summary
CREATE OR REPLACE VIEW public.view_monthly_summary AS
SELECT 
  DATE_TRUNC('month', tl.due_date)::date AS month_start,
  m.id AS member_id,
  m.name AS member_name,
  COUNT(*) FILTER (WHERE tl.status = 'completed') AS tasks_completed,
  COUNT(*) FILTER (WHERE tl.status = 'missed') AS tasks_missed,
  COUNT(*) FILTER (WHERE tl.status = 'pending') AS tasks_pending,
  COALESCE(SUM(p.points_awarded), 0) AS total_points,
  ROUND(
    COUNT(*) FILTER (WHERE tl.status = 'completed')::numeric / 
    NULLIF(COUNT(*) FILTER (WHERE tl.status IN ('completed', 'missed'))::numeric, 0) * 100,
    2
  ) AS completion_rate
FROM public.task_logs tl
JOIN public.task_assignments ta ON ta.id = tl.assignment_id
JOIN public.members m ON m.id = ta.member_id
LEFT JOIN public.points p ON p.task_log_id = tl.id
WHERE m.is_active = true
GROUP BY month_start, m.id, m.name
ORDER BY month_start DESC, total_points DESC;

COMMENT ON VIEW public.view_monthly_summary IS 'Monthly aggregated statistics per member';

-- View: Task Performance (which tasks are completed most/least)
CREATE OR REPLACE VIEW public.view_task_performance AS
SELECT 
  t.id AS task_id,
  t.name AS task_name,
  t.points_value,
  COUNT(*) FILTER (WHERE tl.status = 'completed') AS times_completed,
  COUNT(*) FILTER (WHERE tl.status = 'missed') AS times_missed,
  ROUND(
    COUNT(*) FILTER (WHERE tl.status = 'completed')::numeric / 
    NULLIF(COUNT(*) FILTER (WHERE tl.status IN ('completed', 'missed'))::numeric, 0) * 100,
    2
  ) AS completion_rate
FROM public.tasks t
LEFT JOIN public.task_assignments ta ON ta.task_id = t.id
LEFT JOIN public.task_logs tl ON tl.assignment_id = ta.id AND tl.status IN ('completed', 'missed')
GROUP BY t.id, t.name, t.points_value
ORDER BY completion_rate DESC NULLS LAST;

COMMENT ON VIEW public.view_task_performance IS 'Shows which tasks have the highest and lowest completion rates';
