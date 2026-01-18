-- Seed predefined tasks for the Family Routine Assistant

-- Salah prayers (5 daily prayers)
INSERT INTO public.predefined_tasks (name, description, default_points) VALUES
('Fajr Prayer', 'Morning prayer before sunrise', 15),
('Dhuhr Prayer', 'Midday prayer', 15),
('Asr Prayer', 'Afternoon prayer', 15),
('Maghrib Prayer', 'Evening prayer after sunset', 15),
('Isha Prayer', 'Night prayer', 15);

-- Drinking Water
INSERT INTO public.predefined_tasks (name, description, default_points) VALUES
('Drink Water', 'Hydration reminder', 10);

-- Sleeping Schedule
INSERT INTO public.predefined_tasks (name, description, default_points) VALUES
('Bedtime', 'Time to sleep', 10);

-- Medicine (template for elders)
INSERT INTO public.predefined_tasks (name, description, default_points) VALUES
('Take Medicine', 'Medicine reminder (customize per member)', 15);

-- Additional common tasks
INSERT INTO public.predefined_tasks (name, description, default_points) VALUES
('Morning Exercise', 'Physical activity', 10),
('Study Time', 'Learning and homework', 10),
('Breakfast', 'Morning meal', 10),
('Lunch', 'Midday meal', 10),
('Dinner', 'Evening meal', 10);
