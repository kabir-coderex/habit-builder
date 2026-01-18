# 🏠 Family Routine Assistant (MVP)

A shared-device system to help families follow daily routines through voice announcements, visual prompts, **gamification**, task completion tracking, and detailed analytics — without complex hardware.

---

## 🎯 Goal

Create a simple, reliable, and inclusive family routine system where:

- A **guardian** manages routines from a web dashboard
- A **single shared mobile device** announces tasks and records completion
- Family members complete tasks with **one tap**
- **Gamification (points & streaks)** motivates consistency
- Clear analytics and reports help build discipline and habits

---

## 1️⃣ User Stories

### 👤 Guardian (Admin)

#### Member Management
- As a guardian, I want to create family members with name and photo, so tasks can be tracked individually.
- As a guardian, I want to activate or deactivate members.

---

#### Task Management
- As a guardian, I want to create tasks with:
  - Task name  
  - Task image  
  - Voice announcement text  
  - Task type (general, religious, health)
- So tasks are clear and recognizable.

---

#### Predefined Tasks
- As a guardian, I want to use predefined tasks so I don’t need to create everything manually.

**Predefined Task Types**
1. **Salah Tracking**
   - Required for all members
   - 5 daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha)
   - Streak-based tracking
   - Daily, weekly, monthly reports

2. **Drinking Water**
   - Required for all members
   - Time-based reminders
   - Completion tracking

3. **Sleeping Schedule**
   - Required for all members
   - Night-time routine
   - Missed/completed reports

4. **Medicine**
   - Optional (assigned to specific members)
   - Requires:
     - Medicine name
     - Medicine image
   - Member-specific reports
   - Designed for elders (visual clarity)

---

#### Scheduling & Assignment
- As a guardian, I want to assign tasks:
  - to everyone  
  - or specific members
- As a guardian, I want to schedule tasks by:
  - specific date (e.g. 15th of month)
  - weekdays (Mon–Fri)
  - daily
- As a guardian, I want to define task duration windows.

---

#### Monitoring & Control
- As a guardian, I want tasks to auto-expire after the duration.
- As a guardian, I want voice announcements to play automatically.
- As a guardian, I want to see who completed or missed tasks.

---

#### Analytics, Reports & Gamification
- As a guardian, I want to see:
  - Daily / Weekly / Monthly / Yearly reports
  - Custom date range reports
- As a guardian, I want to see:
  - Member-wise points
  - Streaks per task
  - Missed task trends
- So I can monitor discipline and consistency.

---

### 👨‍👩‍👧 Family Member (Shared Device User)

- As a family member, I want to see:
  - My name & photo
  - Task image
  - Task title
- As a family member, I want to complete a task by tapping **DONE**.
- As a family member, I want tasks to disappear automatically after time ends.
- As a family member, I want to earn points and maintain streaks.
- As a family member, I want to use the system without logging in.

---

### 🔊 System (Automation)

- As a system, I should announce tasks once per schedule.
- As a system, I should generate task logs at task start.
- As a system, I should auto-mark tasks as **missed** when duration ends.
- As a system, I should calculate points and streaks automatically.
- As a system, I should store all events for analytics.

---

## 2️⃣ Technology Stack

### 🌐 Frontend

#### Guardian Dashboard (Web)
- **React**
- **TypeScript**
- **SCSS**
- **Chart.js / Recharts**
- **Supabase JS SDK**

Deployment:
- **Netlify**
- CI/CD via **GitHub → Netlify**

---

#### Shared Device App (MVP)
- **PWA (Progressive Web App)**
- **React + TypeScript**
- **Fullscreen / kiosk-style UI**
- **Web Speech API (Text-to-Speech)**

---

### 🔊 Voice Announcement
- **Web Speech API**
- Bluetooth speaker support

---

### 🧠 Backend & Database
- **Supabase**
  - PostgreSQL
  - Guardian authentication
  - Task logs
  - Gamification data (points, streaks)
  - SQL views for analytics

---

### 🛠 DevOps
- GitHub
- Netlify CI/CD
- Environment-based configs

- It will be monorepo.
- time zone: Dhaka (asia gmt +6)


---

## 3️⃣ Gamification Rules

### ⭐ Points System
- Task completed on time → **+10 points**
- Critical task (Salah, Medicine) → **+15 points**
- Missed task → **0 points**

---

### 🔥 Streak System
- Completing the same task consecutively increases streak
- Missing a task breaks the streak

**Examples**
- Salah: streak per prayer & overall daily streak
- Drinking water: daily streak
- Sleeping schedule: nightly streak
- Medicine: per-member streak

---

### 🏅 Reports
- Highest streaks
- Total points per member
- Discipline trends over time

---

## 4️⃣ Milestones (MVP Roadmap)

### 🟩 Milestone 1 — Foundation (Week 1)
- Supabase setup & schema
- Guardian auth
- Member management
- Base UI structure

---

### 🟨 Milestone 2 — Tasks & Scheduling (Week 2)
- Task creation & predefined tasks
- Scheduling rules (date, weekday, daily)
- Assignment logic
- Duration handling

---

### 🟦 Milestone 3 — Shared Device App (Week 3)
- Shared PWA UI
- Task rendering per member
- DONE button logic
- Auto-expire behavior
- TTS announcements

---

### 🟪 Milestone 4 — Gamification & Analytics (Week 4)
- Task logs
- Points calculation
- Streak tracking
- Reports & charts
- Member-wise analytics

---

### 🚀 Milestone 5 — Deployment & Polish
- CI/CD pipeline
- Netlify deployment
- UI/UX polish
- Accessibility improvements
- MVP documentation

---

## 🏁 MVP Success Criteria

- Tasks announce correctly on time
- Members complete tasks with one tap
- Points and streaks update correctly
- Missed tasks tracked automatically
- Guardian can clearly view reports

---

## 🌱 Future Enhancements

- Native mobile apps
- Push notifications
- Lock-screen widgets
- Smart speaker integration
- Rewards & badges

---

**This MVP combines discipline, motivation, and simplicity — designed for real families and real habits.**
