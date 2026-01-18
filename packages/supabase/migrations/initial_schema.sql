-- Part 1: Custom Types (Enums)
-- Enum for member roles within a family.
CREATE TYPE public.member_role AS ENUM ('guardian', 'child');

-- Enum for the different types of task schedules.
CREATE TYPE public.schedule_type AS ENUM ('daily', 'weekdays', 'date');

-- Enum for the status of a logged task.
CREATE TYPE public.task_log_status AS ENUM ('pending', 'completed', 'missed');


-- Part 2: Table Definitions
-- Table to hold family units.
CREATE TABLE public.families (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    timezone text NOT NULL DEFAULT 'Asia/Dhaka',
    created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.families IS 'Represents a family unit.';

-- Table for family members.
CREATE TABLE public.members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    user_id uuid NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    name text NOT NULL,
    role public.member_role NOT NULL DEFAULT 'child',
    avatar_url text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.members IS 'Stores individual family members, linking guardians to auth users.';
CREATE INDEX idx_members_family_id ON public.members(family_id);
CREATE INDEX idx_members_user_id ON public.members(user_id);

-- Table for predefined, system-wide tasks.
CREATE TABLE public.predefined_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    default_points integer NOT NULL DEFAULT 10
);
COMMENT ON TABLE public.predefined_tasks IS 'Templates for common tasks like Salah, Water, etc.';

-- Table for tasks customized by a family.
CREATE TABLE public.tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    predefined_task_id uuid REFERENCES public.predefined_tasks(id) ON DELETE SET NULL,
    name text NOT NULL,
    description text,
    points_value integer NOT NULL DEFAULT 10,
    image_url text,
    voice_text text,
    created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.tasks IS 'Reusable tasks created and customized by a family.';
CREATE INDEX idx_tasks_family_id ON public.tasks(family_id);

-- Table to define task schedules.
CREATE TABLE public.task_schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    schedule_type public.schedule_type NOT NULL,
    scheduled_time time NOT NULL,
    duration_minutes integer NOT NULL DEFAULT 60,
    -- For 'weekdays' type, array of integers [0=Sun, 1=Mon, ..., 6=Sat]
    weekdays integer[],
    -- For 'date' type
    scheduled_date date,
    CONSTRAINT valid_weekdays CHECK (
        schedule_type != 'weekdays' OR
        (weekdays IS NOT NULL AND array_length(weekdays, 1) > 0)
    ),
    CONSTRAINT valid_scheduled_date CHECK (
        schedule_type != 'date' OR scheduled_date IS NOT NULL
    )
);
COMMENT ON TABLE public.task_schedules IS 'Defines when a task should occur. A task can have multiple schedules (e.g., 5 for Salah).';
CREATE INDEX idx_task_schedules_task_id ON public.task_schedules(task_id);

-- Junction table to assign tasks to members.
CREATE TABLE public.task_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (task_id, member_id)
);
COMMENT ON TABLE public.task_assignments IS 'Assigns a specific task to a family member.';
CREATE INDEX idx_task_assignments_task_id ON public.task_assignments(task_id);
CREATE INDEX idx_task_assignments_member_id ON public.task_assignments(member_id);

-- Table to log daily instances of assigned tasks.
CREATE TABLE public.task_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id uuid NOT NULL REFERENCES public.task_assignments(id) ON DELETE CASCADE,
    due_date date NOT NULL,
    due_time time NOT NULL,
    status public.task_log_status NOT NULL DEFAULT 'pending',
    completed_at timestamptz,
    notes text,
    UNIQUE (assignment_id, due_date, due_time)
);
COMMENT ON TABLE public.task_logs IS 'A daily to-do list item. Generated when a task becomes active based on its schedule.';
CREATE INDEX idx_task_logs_assignment_id ON public.task_logs(assignment_id);
CREATE INDEX idx_task_logs_due_date_status ON public.task_logs(due_date, status);

-- Table to record points earned by members.
CREATE TABLE public.points (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    task_log_id uuid NOT NULL REFERENCES public.task_logs(id) ON DELETE CASCADE,
    points_awarded integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.points IS 'A ledger of all points awarded to a member for completing tasks.';
CREATE INDEX idx_points_member_id ON public.points(member_id);

-- Table to track completion streaks for tasks.
CREATE TABLE public.streaks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    current_streak integer NOT NULL DEFAULT 0,
    longest_streak integer NOT NULL DEFAULT 0,
    last_completed_date date,
    UNIQUE (member_id, task_id)
);
COMMENT ON TABLE public.streaks IS 'Tracks current and longest completion streaks for a member and a task.';
CREATE INDEX idx_streaks_member_id_task_id ON public.streaks(member_id, task_id);


-- Part 3: Enable Row Level Security (Best Practice)
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predefined_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
