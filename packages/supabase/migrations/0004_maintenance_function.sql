-- Create a function that can be called by HTTP to run daily maintenance tasks
-- This function should be called by a cron job or scheduled task

CREATE OR REPLACE FUNCTION public.run_daily_maintenance()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
  v_logs_generated integer;
  v_tasks_expired integer;
BEGIN
  -- Generate today's task logs
  PERFORM public.generate_todays_task_logs();
  
  -- Get count of logs generated today
  SELECT COUNT(*)
  INTO v_logs_generated
  FROM public.task_logs
  WHERE due_date = CURRENT_DATE;
  
  -- Mark expired tasks as missed
  PERFORM public.mark_expired_tasks_as_missed();
  
  -- Get count of tasks marked as missed
  SELECT COUNT(*)
  INTO v_tasks_expired
  FROM public.task_logs
  WHERE status = 'missed' 
    AND due_date = CURRENT_DATE;
  
  -- Return summary
  v_result := json_build_object(
    'success', true,
    'timestamp', NOW(),
    'logs_generated_today', v_logs_generated,
    'tasks_expired_today', v_tasks_expired,
    'message', 'Daily maintenance completed successfully'
  );
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'timestamp', NOW()
    );
END;
$$;

COMMENT ON FUNCTION public.run_daily_maintenance IS 'Runs daily maintenance tasks: generates task logs and marks expired tasks as missed';

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION public.run_daily_maintenance() TO authenticated, service_role;
