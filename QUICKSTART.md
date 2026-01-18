# 🚀 Quick Start Guide

Get the Family Routine Assistant MVP running locally in under 10 minutes!

## Prerequisites

- Node.js 18+
- pnpm (install: `npm install -g pnpm`)
- A Supabase account (free tier is fine)

## Step 1: Install Dependencies (2 min)

```bash
cd habit-builder
pnpm install
```

## Step 2: Set Up Supabase (3 min)

1. Go to https://supabase.com and create a new project
2. Wait for the database to initialize (~2 minutes)
3. Go to Project Settings > API
4. Copy your Project URL and anon/public key

## Step 3: Configure Environment Variables (1 min)

Create `.env.local` in both apps:

**apps/guardian-dashboard/.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**apps/pwa/.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Run Database Migrations (2 min)

In Supabase Dashboard > SQL Editor, run these files in order:

1. Copy contents of `packages/supabase/migrations/initial_schema.sql` → Run
2. Copy contents of `packages/supabase/migrations/0001_rls_policies.sql` → Run
3. Copy contents of `packages/supabase/migrations/0002_functions_and_triggers.sql` → Run
4. Copy contents of `packages/supabase/migrations/0003_analytics_views.sql` → Run
5. Copy contents of `packages/supabase/migrations/0004_maintenance_function.sql` → Run
6. Copy contents of `packages/supabase/seed/predefined_tasks.sql` → Run

Verify tables are created: Database > Tables (you should see 9 tables)

## Step 5: Start Development Servers (1 min)

```bash
pnpm dev
```

This starts both apps:
- Guardian Dashboard: http://localhost:3000
- PWA: http://localhost:3001

## Step 6: Create Your Account (1 min)

1. Go to http://localhost:3000/signup
2. Fill in:
   - Email: test@example.com
   - Password: test123
   - Family Name: Test Family
   - Your Name: Test Guardian
3. Click "Create Account"
4. You'll be redirected to the Members page

## Step 7: Test the System (5 min)

### Add a Family Member
1. Go to Members page
2. Click "+ Add Member"
3. Create a child member (e.g., "Alice")

### Create a Task
1. Go to Tasks page
2. Click "+ Create Task"
3. Select "Fajr Prayer" from predefined tasks OR create custom
4. Click "Create Task"

### Schedule the Task
1. Go to Schedules page
2. Click "+ Create Schedule"
3. Select your task
4. Choose "Daily" schedule
5. Set time (e.g., 08:00 AM)
6. Duration: 30 minutes
7. Check "Assign to all active members"
8. Click "Create Schedule"

### Generate Task Logs
In Supabase SQL Editor, run:
```sql
SELECT public.run_daily_maintenance();
```

This creates today's task instances.

### Test the PWA
1. Open http://localhost:3001 in a browser
2. Click "Enable Sound"
3. You should see the scheduled task!
4. Click "DONE" to complete it
5. Go back to Guardian Dashboard > Analytics to see points awarded

## 🎉 Success!

Your Family Routine Assistant MVP is now running! 

## What's Next?

### For Testing
- Add more members
- Create multiple tasks (use predefined ones like "Drink Water", "Dhuhr Prayer")
- Schedule tasks at different times
- Complete tasks and watch points/streaks accumulate

### For Development
- Check out the codebase in `apps/guardian-dashboard/src`
- Modify components in `apps/guardian-dashboard/src/components/dashboard`
- Customize styles in `.module.scss` files
- Add new features!

### For Production
- Follow [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment steps
- Set up automatic daily maintenance
- Configure custom domains

## Common Issues

**"Error connecting to database"**
- Check your environment variables are correct
- Verify Supabase project is running
- Ensure you copied the ANON key (not service role key)

**"No tasks showing in PWA"**
- Run the daily maintenance function to generate task logs
- Check that schedules exist and are assigned to members
- Verify today's date matches your schedule

**"Voice not working"**
- Click "Enable Sound" button (required for TTS)
- Use Chrome browser (best TTS support)
- Check browser console for errors

## Need Help?

- Check [README.md](./README.md) for detailed documentation
- Review [project-info/idea.md](./project-info/idea.md) for requirements
- Check Supabase logs: Dashboard > Logs
- Check browser console: F12 > Console

---

Happy coding! 🚀
