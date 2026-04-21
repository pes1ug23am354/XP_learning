# XPLearning Architecture

## Product Model
- Subject -> Chapters -> Topics
- Topic flow: `Study Content` -> `Mark Read` -> `Quiz` -> `Pass to Unlock Next`
- Chapter flow: complete all topic levels -> unlock chapter challenge
- Subject completion: clear all chapter challenges -> full stats dashboard

## Tech Stack
- Frontend: React + Tailwind CSS + Framer Motion + Axios
- Backend: Node.js + Express + JWT + PostgreSQL (`pg`)
- Database: PostgreSQL

## Key Systems
1. Progression Engine
- Topic unlock graph is strict and server-controlled.
- Read gate required before quiz attempt.
- Failed quizzes do not unlock next topic.

2. XP Engine
- Accuracy-based XP baseline.
- Bonuses for speed, streak, perfect score.
- Replay supported for additional XP.

3. Streak System
- Daily activity updates streak state.
- Current and longest streak maintained.

4. Support Ticket System
- Learners can raise tickets.
- Admin can reply/update status/resolve tickets.

5. Admin CMS
- Create subjects, chapters, topics.
- Manage users and roles.

## Security
- JWT auth for all protected APIs.
- Role-based guard for admin endpoints.
- Validation middleware for payload enforcement.
