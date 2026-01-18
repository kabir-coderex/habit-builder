-- Migration for automated task log generation and gamification functions

-- Function to generate task logs for today based on schedules
CREATE OR REPLACE FUNCTION public.generate_todays_task_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_schedule RECORD;
  v_assignment RECORD;
  v_today date := CURRENT_DATE;
  v_dow integer := EXTRACT(DOW FROM v_today); -- 0=Sunday, 6=Saturday
BEGIN
  -- Loop through all task schedules
  FOR v_schedule IN
    SELECT * FROM public.task_schedules
  LOOP
    -- Check if schedule applies to today
    IF (v_schedule.schedule_type = 'daily') OR
       (v_schedule.schedule_type = 'weekdays' AND v_dow = ANY(v_schedule.weekdays)) OR
       (v_schedule.schedule_type = 'date' AND v_schedule.scheduled_date = v_today)
    THEN
      -- Find all active assignments for this task
      FOR v_assignment IN
        SELECT ta.id, ta.member_id
        FROM public.task_assignments ta
        WHERE ta.task_id = v_schedule.task_id
          AND ta.is_active = true
      LOOP
        -- Insert task log if it doesn't already exist
        INSERT INTO public.task_logs (assignment_id, due_date, due_time, status)
        VALUES (v_assignment.id, v_today, v_schedule.scheduled_time, 'pending')
        ON CONFLICT (assignment_id, due_date, due_time) DO NOTHING;
      END LOOP;
    END IF;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.generate_todays_task_logs IS 'Generates task logs for today based on active schedules and assignments';

-- Function to mark expired tasks as missed
CREATE OR REPLACE FUNCTION public.mark_expired_tasks_as_missed()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now timestamptz := NOW();
BEGIN
  -- Update task logs that are past their due time + duration
  UPDATE public.task_logs tl
  SET status = 'missed'
  FROM public.task_assignments ta
  JOIN public.task_schedules ts ON ts.task_id = ta.task_id
  WHERE tl.assignment_id = ta.id
    AND tl.status = 'pending'
    AND (tl.due_date::timestamp + tl.due_time + (ts.duration_minutes || ' minutes')::interval) < v_now;
END;
$$;

COMMENT ON FUNCTION public.mark_expired_tasks_as_missed IS 'Marks pending task logs as missed when they exceed their due time + duration';

-- Function to calculate points and update streaks when a task is completed
CREATE OR REPLACE FUNCTION public.award_points_and_update_streaks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_member_id uuid;
  v_task_id uuid;
  v_points integer;
  v_current_streak integer;
  v_last_completed date;
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get member_id, task_id, and points from related tables
    SELECT ta.member_id, ta.task_id, t.points_value
    INTO v_member_id, v_task_id, v_points
    FROM public.task_assignments ta
    JOIN public.tasks t ON t.id = ta.task_id
    WHERE ta.id = NEW.assignment_id;

    -- Award points
    INSERT INTO public.points (member_id, task_log_id, points_awarded)
    VALUES (v_member_id, NEW.id, v_points);

    -- Update streaks
    -- Get current streak info
    SELECT current_streak, last_completed_date
    INTO v_current_streak, v_last_completed
    FROM public.streaks
    WHERE member_id = v_member_id AND task_id = v_task_id;

    IF FOUND THEN
      -- Streak record exists
      IF v_last_completed = NEW.due_date - INTERVAL '1 day' THEN
        -- Consecutive day - increment streak
        UPDATE public.streaks
        SET current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak, current_streak + 1),
            last_completed_date = NEW.due_date
        WHERE member_id = v_member_id AND task_id = v_task_id;
      ELSIF v_last_completed < NEW.due_date - INTERVAL '1 day' THEN
        -- Gap in streak - reset to 1
        UPDATE public.streaks
        SET current_streak = 1,
            last_completed_date = NEW.due_date
        WHERE member_id = v_member_id AND task_id = v_task_id;
      ELSE
        -- Same day or already completed today
        UPDATE public.streaks
        SET last_completed_date = NEW.due_date
        WHERE member_id = v_member_id AND task_id = v_task_id;
      END IF;
    ELSE
      -- No streak record - create one
      INSERT INTO public.streaks (member_id, task_id, current_streak, longest_streak, last_completed_date)
      VALUES (v_member_id, v_task_id, 1, 1, NEW.due_date);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for automatic points and streak updates
DROP TRIGGER IF EXISTS trigger_award_points_and_streaks ON public.task_logs;
CREATE TRIGGER trigger_award_points_and_streaks
  AFTER INSERT OR UPDATE ON public.task_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.award_points_and_update_streaks();

COMMENT ON TRIGGER trigger_award_points_and_streaks ON public.task_logs IS 'Automatically awards points and updates streaks when a task is completed';
