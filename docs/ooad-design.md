# OOAD Design - Reward-Based Learning Platform

## 1. Use Case Diagram (Textual)

**Actors:**
- User (Learner)
- Admin
- System (External actor for token verification and DB persistence)

**Use Cases:**
- User:
  - Register account
  - Login
  - View courses
  - View tasks by course
  - Attempt task
  - Track progress
  - View reward catalog
  - Redeem reward
- Admin:
  - Login
  - Add/Edit/Delete course
  - Add/Edit/Delete task
  - Manage users (update role, activate/deactivate)
  - Configure reward logic
- System:
  - Validate JWT
  - Evaluate task
  - Allocate reward points
  - Update progress
  - Persist redemption history

## 2. Class Diagram (Textual)

### Core Entities
- User
  - Attributes: id, fullName, email, role, pointsBalance
  - Methods: addPoints(), redeemPoints()
- Course
  - Attributes: id, title, description, tasks
  - Methods: addTask()
- Task (abstract)
  - Attributes: id, title, maxPoints, passingScore
  - Methods: evaluateTask(answer) [abstract]
- QuizTask extends Task
  - Attributes: correctAnswer
  - Methods: evaluateTask(answer)
- CodingTask extends Task
  - Attributes: requiredKeyword
  - Methods: evaluateTask(answer)
- Reward
  - Attributes: id, title, pointsCost
- Progress
  - Attributes: userId, courseId, completedTasks, totalTasks, completionPercent
  - Methods: updateProgress(taskPassed)
- RewardService
  - Methods: calculateReward(task, score)

### Relationships
- User 1..* Progress
- Course 1..* Task
- User *..* Task (through TaskAttempt)
- User 1..* RewardRedemption
- RewardService uses Task polymorphically

## 3. Sequence Diagram - Login

1. User -> Frontend: Enter email/password
2. Frontend -> Auth API (`POST /api/auth/login`): Credentials
3. Auth Controller -> User Model: findByEmail(email)
4. User Model -> DB: SELECT user record
5. Auth Controller: bcrypt compare password
6. Auth Controller -> JWT Service: sign token
7. Auth API -> Frontend: user + token
8. Frontend: store token in localStorage and navigate dashboard

## 4. Sequence Diagram - Task Completion

1. User -> Frontend: submit selected option
2. Frontend -> Task API (`POST /api/tasks/:id/attempt`): submittedAnswers
3. Task Controller -> Task Model: getTaskById(taskId)
4. Task Controller: evaluateTask(task, answers)
5. Task Controller -> Reward Model: getActiveRule()
6. Task Controller: calculateReward()
7. Task Controller -> Task Model: createAttempt()
8. Task Controller -> User Model: addPoints()
9. Task Controller -> Progress Model: recalculateProgress()
10. Task API -> Frontend: score, passed, pointsAwarded, updated progress

## 5. Sequence Diagram - Reward Allocation / Redemption

1. User -> Frontend: click redeem
2. Frontend -> Reward API (`POST /api/rewards/redeem/:rewardId`)
3. Reward Controller -> Reward Model: getCatalogItemById()
4. Reward Controller -> User Model: findById()
5. Reward Controller: validate stock and points
6. Reward Controller -> Reward Model: reduceCatalogStock()
7. Reward Controller -> User Model: deductPoints()
8. Reward Controller -> Reward Model: redeemReward()
9. Reward API -> Frontend: redemption status + updated points

## 6. Activity Diagram (Textual)

Start -> User Login -> Token Valid?
- No -> Show Unauthorized -> End
- Yes -> Load Dashboard -> Choose Action:
  - View Courses -> Select Course -> View Tasks
  - Attempt Task -> Evaluate -> Passed?
    - Yes -> Add Points -> Update Progress
    - No -> Update Attempt History
  - Redeem Reward -> Check Points/Stock
    - Valid -> Deduct Points + Record Redemption
    - Invalid -> Show Error
  - Admin Actions -> Manage courses/tasks/users/reward rules
End

## 7. Component Diagram (Textual)

- React Frontend
  - Auth pages, Dashboard, Courses, Tasks, Rewards
  - Axios API Client
- Express Backend
  - Route Layer
  - Controller Layer
  - Model Layer
  - Middleware (Auth, Validation, Error)
- PostgreSQL
  - Users, Courses, Tasks, Attempts, Progress, Rewards tables
- Java OOP Module
  - Domain model simulation for business logic demonstration

Interactions:
- Frontend communicates with Backend over REST/JSON + JWT header
- Backend persists/retrieves data from PostgreSQL
- Java module is standalone for OOAD and business-rule illustration

## 8. Deployment Diagram (Textual)

- Client Node (Browser): React SPA served by Vite/static server
- API Node (Node.js runtime): Express app with JWT middleware
- Database Node (PostgreSQL server): stores application data
- Optional Java Runtime Node: executes OOAD module demo (`Main`)

Connections:
- Browser -> API Node: HTTPS/HTTP REST calls
- API Node -> PostgreSQL Node: TCP via `DATABASE_URL`
- Developer machine -> Java runtime: CLI compile/run for module demonstration
