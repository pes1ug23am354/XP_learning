# XPLearning API

Base URL: `http://localhost:5001/api`

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

## Learner-Only

### Subjects
- `GET /subjects`
- `POST /subjects/:subjectId/enroll`
- `GET /subjects/:subjectId/map`

### Topics & Quizzes
- `GET /topics/:topicId`
- `POST /topics/:topicId/read`
- `POST /topics/:topicId/quiz/start` (15 unique random questions from topic bank)
- `POST /topics/:topicId/quiz` (auto evaluation + XP)
- `POST /topics/chapter-challenge/:chapterId`

### Dashboard / Leaderboard / Support
- `GET /dashboard/me`
- `GET /leaderboard`
- `POST /tickets`
- `GET /tickets/me`

## Admin-Only

### Dashboard Pages
- `GET /admin/analytics`
- `GET /admin/content-tree`

### Content Management
- `POST /admin/subjects`
- `POST /admin/chapters`
- `POST /admin/topics` (minimum 15 MCQs required)

### User Management
- `GET /admin/users`
- `PATCH /admin/users/:userId/role`

### Tickets Management
- `GET /tickets/admin/all`
- `PATCH /tickets/admin/:ticketId` with payload:
  - `{ "reply": "..." }`
  - `{ "status": "resolved" }`
  - or both

Ticket statuses are only: `open`, `resolved`.
Resolved tickets cannot be replied to.
