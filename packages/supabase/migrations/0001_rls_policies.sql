-- Part 1: Helper Functions
-- These functions simplify policy definitions by providing context on the current user.

-- Gets the family_id of the currently authenticated user.
CREATE OR REPLACE FUNCTION public.get_my_family_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT family_id FROM public.members WHERE user_id = auth.uid();
$$;

-- Gets the role of the currently authenticated user.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.member_role
LANGUAGE sql
STABLE
AS $$
  SELECT role FROM public.members WHERE user_id = auth.uid();
$$;

-- Gets the member_id of the currently authenticated user.
CREATE OR REPLACE FUNCTION public.get_my_member_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM public.members WHERE user_id = auth.uid();
$$;


-- Part 2: RLS Policies per Table

-- -------------------------------------------------
-- Table: families
-- -------------------------------------------------
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view their own family's details.
CREATE POLICY "members_can_view_own_family"
ON public.families FOR SELECT
USING (id = public.get_my_family_id());

-- Policy: Guardians can update their own family's details.
CREATE POLICY "guardians_can_update_own_family"
ON public.families FOR UPDATE
USING (id = public.get_my_family_id() AND public.get_my_role() = 'guardian')
WITH CHECK (id = public.get_my_family_id() AND public.get_my_role() = 'guardian');

-- Note: INSERT and DELETE on families should be handled by secure functions, not direct API calls.


-- -------------------------------------------------
-- Table: members
-- -------------------------------------------------
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view other members within their own family.
CREATE POLICY "members_can_view_family_members"
ON public.members FOR SELECT
USING (family_id = public.get_my_family_id());

-- Policy: Guardians can add new members to their family.
CREATE POLICY "guardians_can_insert_family_members"
ON public.members FOR INSERT
WITH CHECK (family_id = public.get_my_family_id() AND public.get_my_role() = 'guardian');

-- Policy: Guardians can update members in their family. Users can update their own profile.
CREATE POLICY "guardians_or_self_can_update_members"
ON public.members FOR UPDATE
USING (
  family_id = public.get_my_family_id() AND
  (public.get_my_role() = 'guardian' OR id = public.get_my_member_id())
);

-- Policy: Guardians can remove members from their family.
CREATE POLICY "guardians_can_delete_family_members"
ON public.members FOR DELETE
USING (family_id = public.get_my_family_id() AND public.get_my_role() = 'guardian');


-- -------------------------------------------------
-- Table: predefined_tasks
-- -------------------------------------------------
ALTER TABLE public.predefined_tasks ENABLE ROW LEVEL SECURITY;

-- Policy: All users (including anonymous) can view predefined tasks.
CREATE POLICY "all_users_can_view_predefined_tasks"
ON public.predefined_tasks FOR SELECT
USING (true);


-- -------------------------------------------------
-- Table: tasks
-- -------------------------------------------------
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view tasks belonging to their family.
CREATE POLICY "members_can_view_family_tasks"
ON public.tasks FOR SELECT
USING (family_id = public.get_my_family_id());

-- Policy: Guardians can create, update, and delete tasks for their family.
CREATE POLICY "guardians_can_crud_family_tasks"
ON public.tasks FOR ALL
USING (family_id = public.get_my_family_id() AND public.get_my_role() = 'guardian')
WITH CHECK (family_id = public.get_my_family_id() AND public.get_my_role() = 'guardian');


-- -------------------------------------------------
-- Table: task_schedules
-- -------------------------------------------------
ALTER TABLE public.task_schedules ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view schedules for tasks in their family.
CREATE POLICY "members_can_view_family_schedules"
ON public.task_schedules FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_schedules.task_id AND tasks.family_id = public.get_my_family_id()
  )
);

-- Policy: Guardians can manage schedules for their family's tasks.
CREATE POLICY "guardians_can_crud_family_schedules"
ON public.task_schedules FOR ALL
USING (
  public.get_my_role() = 'guardian' AND
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_schedules.task_id AND tasks.family_id = public.get_my_family_id()
  )
)
WITH CHECK (
  public.get_my_role() = 'guardian' AND
  EXISTS (
    SELECT 1 FROM public.tasks
    WHERE tasks.id = task_schedules.task_id AND tasks.family_id = public.get_my_family_id()
  )
);


-- -------------------------------------------------
-- Table: task_assignments
-- -------------------------------------------------
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view all task assignments within their family.
CREATE POLICY "members_can_view_family_assignments"
ON public.task_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.members
    WHERE members.id = task_assignments.member_id AND members.family_id = public.get_my_family_id()
  )
);

-- Policy: Guardians can manage assignments for their family.
CREATE POLICY "guardians_can_crud_family_assignments"
ON public.task_assignments FOR ALL
USING (
  public.get_my_role() = 'guardian' AND
  EXISTS (
    SELECT 1 FROM public.members
    WHERE members.id = task_assignments.member_id AND members.family_id = public.get_my_family_id()
  )
)
WITH CHECK (
  public.get_my_role() = 'guardian' AND
  EXISTS (
    SELECT 1 FROM public.members
    WHERE members.id = task_assignments.member_id AND members.family_id = public.get_my_family_id()
  )
);


-- -------------------------------------------------
-- Table: task_logs
-- -------------------------------------------------
ALTER TABLE public.task_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view all task logs within their family.
CREATE POLICY "members_can_view_family_logs"
ON public.task_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.task_assignments ta
    JOIN public.members m ON ta.member_id = m.id
    WHERE ta.id = task_logs.assignment_id AND m.family_id = public.get_my_family_id()
  )
);

-- Policy: Authenticated users can insert logs for assignments in their family.
CREATE POLICY "users_can_insert_family_logs"
ON public.task_logs FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.task_assignments ta
    JOIN public.members m ON ta.member_id = m.id
    WHERE ta.id = task_logs.assignment_id AND m.family_id = public.get_my_family_id()
  )
);

-- Policy: Authenticated users can update logs (e.g., complete) for their family.
CREATE POLICY "users_can_update_family_logs"
ON public.task_logs FOR UPDATE
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.task_assignments ta
    JOIN public.members m ON ta.member_id = m.id
    WHERE ta.id = task_logs.assignment_id AND m.family_id = public.get_my_family_id()
  )
);

-- Policy: NO ONE can delete task logs.
CREATE POLICY "no_one_can_delete_logs"
ON public.task_logs FOR DELETE
USING (false);


-- -------------------------------------------------
-- Tables: points and streaks (Gamification)
-- -------------------------------------------------
ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view points and streaks within their family.
CREATE POLICY "members_can_view_family_gamification"
ON public.points FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.members
    WHERE members.id = points.member_id AND members.family_id = public.get_my_family_id()
  )
);

CREATE POLICY "members_can_view_family_gamification"
ON public.streaks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.members
    WHERE members.id = streaks.member_id AND members.family_id = public.get_my_family_id()
  )
);

-- Note: INSERT, UPDATE, DELETE on points and streaks should be handled by secure triggers or functions, not direct API calls.
-- We can add a policy to prevent direct modification.
CREATE POLICY "admin_only_modification"
ON public.points FOR ALL
USING (false)
WITH CHECK (false);

CREATE POLICY "admin_only_modification"
ON public.streaks FOR ALL
USING (false)
WITH CHECK (false);
