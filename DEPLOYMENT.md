# 🚀 Deployment Checklist

## Pre-Deployment Setup

### 1. Supabase Setup
- [ ] Create a Supabase project at https://supabase.com
- [ ] Note down your project URL and anon key from Project Settings > API
- [ ] Run all migrations in the SQL Editor:
  - [ ] `initial_schema.sql`
  - [ ] `0001_rls_policies.sql`
  - [ ] `0002_functions_and_triggers.sql`
  - [ ] `0003_analytics_views.sql`
  - [ ] `0004_maintenance_function.sql`
  - [ ] `predefined_tasks.sql` (seed data)
- [ ] Test that tables are created: Check Database > Tables
- [ ] Verify RLS policies: Database > Policies

### 2. Netlify Setup (Guardian Dashboard)
- [ ] Go to https://netlify.com and sign in
- [ ] Click "Add new site" > "Import an existing project"
- [ ] Connect to your Git repository
- [ ] Configure build settings:
  ```
  Build command: pnpm run build --filter=guardian-dashboard
  Publish directory: apps/guardian-dashboard/.next
  Base directory: .
  ```
- [ ] Add environment variables (Site settings > Environment variables):
  - `NEXT_PUBLIC_SUPABASE_URL` = your_supabase_url
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your_anon_key
- [ ] Deploy site
- [ ] Test the deployed dashboard
- [ ] Create an account via /signup

### 3. Netlify Setup (PWA)
- [ ] Create a second site in Netlify
- [ ] Connect to the same Git repository
- [ ] Configure build settings:
  ```
  Build command: pnpm run build --filter=pwa
  Publish directory: apps/pwa/.next
  Base directory: .
  ```
- [ ] Add the same environment variables
- [ ] Deploy site
- [ ] Test PWA on mobile/tablet
- [ ] Add to home screen and test as standalone app

## Post-Deployment Configuration

### 4. Set Up Daily Maintenance (Choose One)

#### Option A: Manual (for testing)
Run this SQL command daily in Supabase SQL Editor:
```sql
SELECT public.run_daily_maintenance();
```

#### Option B: Supabase Edge Function (Recommended)
1. Install Supabase CLI: `npm install -g supabase`
2. Create an Edge Function:
   ```bash
   supabase functions new daily-maintenance
   ```
3. Add code to call `run_daily_maintenance()`
4. Deploy: `supabase functions deploy daily-maintenance`
5. Set up a cron service (GitHub Actions, Vercel Cron, etc.) to call this function daily

#### Option C: External Cron Job
- Use a service like cron-job.org or EasyCron
- Set up a daily job that calls your Supabase function via API

### 5. Testing Checklist
- [ ] **Authentication**
  - [ ] Sign up creates family and guardian
  - [ ] Login works
  - [ ] Logout works
  - [ ] Protected routes redirect to login
  
- [ ] **Members**
  - [ ] Can create members
  - [ ] Can edit members
  - [ ] Can deactivate/activate members
  - [ ] Can delete members
  
- [ ] **Tasks**
  - [ ] Can create custom tasks
  - [ ] Can use predefined tasks
  - [ ] Can edit tasks
  - [ ] Can delete tasks
  
- [ ] **Schedules**
  - [ ] Can create daily schedule
  - [ ] Can create weekday schedule
  - [ ] Can create date-specific schedule
  - [ ] Can assign to all members
  - [ ] Can assign to specific members
  
- [ ] **PWA**
  - [ ] Tasks display correctly
  - [ ] Voice announcements work
  - [ ] DONE button completes tasks
  - [ ] Tasks refresh automatically
  - [ ] Works in fullscreen/standalone mode
  
- [ ] **Gamification**
  - [ ] Points awarded on task completion
  - [ ] Streaks increment correctly
  - [ ] Analytics show correct data
  
- [ ] **Analytics**
  - [ ] Leaderboard shows points
  - [ ] Streaks display correctly
  - [ ] Reports show task history
  - [ ] Period filters work (today/week/month)

### 6. Production Optimization
- [ ] Enable Supabase database backups
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure custom domains for both apps
- [ ] Enable HTTPS (automatic with Netlify)
- [ ] Test on various devices and browsers
- [ ] Set up analytics (Google Analytics, Plausible, etc.)

## Daily Operations

### Guardian Workflow
1. Add/manage family members
2. Create tasks and schedules
3. Review analytics and reports
4. Adjust schedules based on performance

### Family Member Workflow
1. Check shared device for tasks
2. Complete tasks by tapping DONE
3. Watch points and streaks grow

### System Maintenance
- Run daily maintenance function (automatic if set up)
- Monitor Supabase usage and logs
- Check Netlify build logs for errors
- Review analytics for issues

## Troubleshooting

### Issue: Tasks not appearing in PWA
- Check that schedules are created
- Verify task_assignments exist
- Run `SELECT public.generate_todays_task_logs();` manually
- Check browser console for errors

### Issue: Points not awarded
- Verify trigger is installed: `trigger_award_points_and_streaks`
- Check task_logs status changes to 'completed'
- Review Supabase logs for errors

### Issue: Voice not working
- Ensure user clicked "Enable Sound" button
- Check browser console for TTS errors
- Test on different browsers (Chrome works best)

### Issue: Real-time updates not working
- Verify Supabase real-time is enabled
- Check browser console for subscription errors
- Polling should still work even if real-time fails

## Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Netlify Docs**: https://docs.netlify.com
- **Project Repo**: [Your GitHub URL]

---

**Once all checkboxes are complete, your Family Routine Assistant MVP is ready to use! 🎉**
