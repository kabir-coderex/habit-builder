# 🏠 Family Routine Assistant (MVP)

A shared-device system to help families follow daily routines through voice announcements, visual prompts, gamification, task completion tracking, and detailed analytics.

## 🎯 Features

### For Guardians (Web Dashboard)
- ✅ **Member Management**: Add family members with names, photos, and roles
- ✅ **Task Management**: Create custom tasks or use predefined templates (Salah, Water, Sleep, Medicine)
- ✅ **Smart Scheduling**: Schedule tasks daily, on specific weekdays, or for specific dates
- ✅ **Task Assignment**: Assign tasks to all members or specific individuals
- ✅ **Analytics Dashboard**: View points, streaks, completion rates, and detailed reports
- ✅ **Gamification**: Automatic point calculation and streak tracking

### For Family Members (Shared Device PWA)
- ✅ **Task Display**: See your active tasks with member photos and task images
- ✅ **Voice Announcements**: Automatic TTS announcements when tasks become active
- ✅ **One-Tap Completion**: Mark tasks as done with a single tap
- ✅ **Real-time Updates**: Tasks update automatically without refresh
- ✅ **Auto-Expiry**: Tasks disappear when their time window ends

### System Automation
- ✅ **Auto-Generate Task Logs**: Creates daily task instances from schedules
- ✅ **Auto-Expire Tasks**: Marks pending tasks as missed after duration
- ✅ **Points & Streaks**: Automatically calculates points and tracks consecutive completions
- ✅ **Real-time Sync**: Database changes reflect immediately across devices

## 🏗️ Tech Stack

### Frontend
- **Guardian Dashboard**: Next.js 14, TypeScript, SCSS Modules
- **PWA**: Next.js 14 (Progressive Web App), Web Speech API for TTS
- **Styling**: SCSS with modular approach
- **Authentication**: Supabase Auth

### Backend & Database
- **Supabase**: PostgreSQL database, Row Level Security, Real-time subscriptions
- **Database Functions**: Automated task log generation, expiry checking, gamification

### DevOps
- **Monorepo**: Turborepo for efficient builds
- **Package Manager**: pnpm
- **Deployment**: Netlify with CI/CD
- **Version Control**: Git

## 📁 Project Structure

```
habit-builder/
├── apps/
│   ├── guardian-dashboard/      # Web dashboard for guardians
│   │   └── src/
│   │       ├── app/              # Next.js app directory
│   │       ├── components/       # React components
│   │       ├── lib/              # Utilities and Supabase clients
│   │       └── types/            # TypeScript types
│   └── pwa/                      # Shared device PWA
│       └── src/
│           ├── app/              # Next.js app directory
│           ├── components/       # PWA components
│           └── lib/              # TTS and Supabase
├── packages/
│   ├── supabase/                 # Database schema and migrations
│   │   ├── migrations/           # SQL migration files
│   │   └── seed/                 # Seed data
│   ├── ui/                       # Shared UI components (future)
│   └── tsconfig/                 # Shared TypeScript configs
└── project-info/
    └── idea.md                   # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account
- Netlify account (for deployment)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd habit-builder
pnpm install
```

### 2. Set up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to Project Settings > API to get your credentials
3. Create `.env.local` files in both apps:

**apps/guardian-dashboard/.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**apps/pwa/.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Run Database Migrations

In the Supabase SQL Editor, run these migrations in order:

1. `packages/supabase/migrations/initial_schema.sql`
2. `packages/supabase/migrations/0001_rls_policies.sql`
3. `packages/supabase/migrations/0002_functions_and_triggers.sql`
4. `packages/supabase/migrations/0003_analytics_views.sql`
5. `packages/supabase/migrations/0004_maintenance_function.sql`
6. `packages/supabase/seed/predefined_tasks.sql` (seed data)

### 4. Run Development Servers

```bash
# Run both apps
pnpm dev

# Or run individually
pnpm --filter guardian-dashboard dev
pnpm --filter pwa dev
```

- Guardian Dashboard: http://localhost:3000
- PWA: http://localhost:3001

### 5. Create Your First Account

1. Go to http://localhost:3000/signup
2. Create an account (this creates a family and guardian member)
3. Start adding members, tasks, and schedules!

## 🎮 Usage Guide

### Setting Up Your Family

1. **Sign Up**: Create your guardian account with family name
2. **Add Members**: Go to Members page and add family members
3. **Create Tasks**: 
   - Use predefined tasks (Salah, Water, Sleep, Medicine)
   - Or create custom tasks with images and voice text
4. **Create Schedules**:
   - Select a task
   - Choose schedule type (daily, weekdays, or specific date)
   - Set time and duration
   - Assign to members
5. **View Analytics**: Check the Analytics page for points, streaks, and reports

### Running the Shared Device

1. Open the PWA on a shared tablet/phone
2. Keep it in a central location
3. Click "Enable Sound" when first loaded
4. Tasks will appear automatically and announce via TTS
5. Family members tap "DONE" when they complete tasks

### Automated Maintenance

The system needs to run maintenance tasks daily:

**Option 1: Call manually via Supabase SQL Editor**
```sql
SELECT public.run_daily_maintenance();
```

**Option 2: Set up a cron job (recommended)**
- Use GitHub Actions, Vercel Cron, or similar
- Call the Supabase function via API daily at midnight

## 📊 Database Schema

### Core Tables
- `families`: Family units
- `members`: Family members (linked to auth users for guardians)
- `tasks`: Custom or predefined tasks
- `task_schedules`: When tasks should occur
- `task_assignments`: Which members should do which tasks
- `task_logs`: Daily task instances
- `points`: Points awarded for completed tasks
- `streaks`: Consecutive completion tracking

### Views for Analytics
- `view_member_points`: Leaderboard
- `view_member_streaks`: Streak summary
- `view_daily_task_report`: Daily breakdown
- `view_weekly_summary`: Weekly stats
- `view_monthly_summary`: Monthly stats

## 🔐 Security

- **Row Level Security (RLS)**: Enabled on all tables
- **Guardian-only access**: Only guardians can modify family data
- **Anonymous PWA access**: PWA can read pending tasks without authentication
- **Secure functions**: Database functions use SECURITY DEFINER

## 🚀 Deployment

### Deploy Guardian Dashboard to Netlify

1. Connect your repo to Netlify
2. Configure build settings:
   - **Build command**: `pnpm run build --filter=guardian-dashboard`
   - **Publish directory**: `apps/guardian-dashboard/.next`
   - **Base directory**: `.`
3. Add environment variables in Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Deploy PWA to Netlify

1. Create a second site in Netlify
2. Configure build settings:
   - **Build command**: `pnpm run build --filter=pwa`
   - **Publish directory**: `apps/pwa/.next`
   - **Base directory**: `.`
3. Add the same environment variables

## 🎯 MVP Success Criteria

- ✅ Tasks announce correctly on time
- ✅ Members complete tasks with one tap
- ✅ Points and streaks update correctly
- ✅ Missed tasks tracked automatically
- ✅ Guardian can clearly view reports

## 🔮 Future Enhancements

- [ ] Native mobile apps (React Native)
- [ ] Push notifications
- [ ] Image upload to Supabase storage
- [ ] Smart speaker integration (Alexa, Google Home)
- [ ] Lock-screen widgets
- [ ] Rewards and badges system
- [ ] Multi-family support
- [ ] Task templates marketplace

## 📝 License

MIT

## 🤝 Contributing

This is an MVP project. Contributions are welcome!

---

**Built with ❤️ for families who want to build better habits together.**
