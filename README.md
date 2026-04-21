# Reward-Based Learning Platform

Production-ready full-stack application with:
- React frontend
- Node.js + Express backend
- PostgreSQL database
- Java OOAD business logic module

## 1. Project Structure

```text
reward-learning-platform/
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/db.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── courseController.js
│       │   ├── taskController.js
│       │   ├── rewardController.js
│       │   └── userController.js
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   ├── validationMiddleware.js
│       │   └── errorMiddleware.js
│       ├── models/
│       │   ├── userModel.js
│       │   ├── courseModel.js
│       │   ├── taskModel.js
│       │   ├── rewardModel.js
│       │   └── progressModel.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── courseRoutes.js
│       │   ├── taskRoutes.js
│       │   ├── rewardRoutes.js
│       │   └── userRoutes.js
│       └── utils/apiResponse.js
├── frontend/
│   ├── package.json
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── api/client.js
│       ├── context/AuthContext.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── ProgressTracker.jsx
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── CoursesPage.jsx
│       │   ├── TasksPage.jsx
│       │   └── RewardsPage.jsx
│       └── styles/global.css
├── database/
│   └── schema.sql
├── java-module/
│   └── src/com/rewardplatform/
│       ├── Main.java
│       ├── model/
│       │   ├── User.java
│       │   ├── Course.java
│       │   ├── Task.java
│       │   ├── QuizTask.java
│       │   ├── CodingTask.java
│       │   ├── Reward.java
│       │   └── Progress.java
│       └── service/
│           └── RewardService.java
└── docs/
    ├── ooad-design.md
    └── api-documentation.md
```

## 2. Database Setup (PostgreSQL)

1. Create database:
```bash
createdb reward_learning
```

2. Run schema + seed:
```bash
psql -U postgres -d reward_learning -f database/schema.sql
```

Seed users:
- Admin: `admin@rewardlearn.com` / `password`
- User: `priya@rewardlearn.com` / `password`

## 3. Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Configure env:
```bash
cp .env.example .env
```
Edit `.env` as required.

3. Run backend:
```bash
npm run dev
```
API runs at `http://localhost:5000`.

## 4. Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure env:
```bash
cp .env.example .env
```

3. Run frontend:
```bash
npm run dev
```
Frontend runs at `http://localhost:5173`.

## 5. Java Module Setup

Compile and run from project root:

```bash
javac -d java-module/bin $(find java-module/src -name "*.java")
java -cp java-module/bin com.rewardplatform.Main
```

## 6. API Docs

Detailed endpoint list and examples are in:
- `docs/api-documentation.md`

## 7. OOAD Diagrams

Textual OOAD artifacts are in:
- `docs/ooad-design.md`
