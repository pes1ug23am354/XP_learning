# XPLearning

Futuristic gamified learning platform with strict progression, dynamic quiz sessions, XP economy, chapter challenges, leaderboard, streaks, support tickets, and role-isolated admin pages.

## Core Fixes Applied

- Ticket system simplified and stabilized:
  - single learner message + single admin reply
  - statuses only `open` / `resolved`
  - resolved tickets reject further replies
- Admin panel simplified into separate pages:
  - `/admin` Dashboard
  - `/admin/subjects` Subjects Management
  - `/admin/users` Users Management
  - `/admin/tickets` Tickets Management
- MCQ handling simplified:
  - preloaded topics keep fixed 45-question bank
  - each attempt randomly samples 15 unique questions
  - retries generate new random sets
  - admin does not edit existing preloaded question banks
  - admin-created topics require minimum 15 MCQs
- Learner progression and XP logic preserved.

## Setup

### Backend (PostgreSQL)

```bash
cd /Users/vivannaik/Desktop/ooad/xplearning/backend
cp .env.example .env
npm install
```

`.env`:

```env
PORT=5001
DATABASE_URL=postgresql://vivannaik@localhost:5432/reward_learning
JWT_SECRET=replace_with_a_long_secret
JWT_EXPIRES_IN=7d
```

Run:

```bash
npm run seed
npm run dev
```

### Frontend

```bash
cd /Users/vivannaik/Desktop/ooad/xplearning/frontend
cp .env.example .env
npm install
npm run dev
```

Frontend URL: `http://localhost:5174`

## Demo Credentials

- Admin: `admin@xplearning.com / admin12345`
- Learner: `learner@xplearning.com / learner12345`
