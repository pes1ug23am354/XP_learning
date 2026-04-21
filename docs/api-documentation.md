# API Documentation

Base URL: `http://localhost:5000/api`

## Auth

### `POST /auth/register`
Request:
```json
{
  "fullName": "New User",
  "email": "new@rewardlearn.com",
  "password": "StrongPass1"
}
```
Response:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 3,
      "full_name": "New User",
      "email": "new@rewardlearn.com",
      "role": "user",
      "points_balance": 0
    },
    "token": "jwt-token"
  }
}
```

### `POST /auth/login`
Request:
```json
{
  "email": "admin@rewardlearn.com",
  "password": "password"
}
```

### `GET /auth/me` (JWT)
Returns current authenticated user profile.

## Courses

### `GET /courses` (JWT)
Returns all courses.

### `POST /courses` (Admin JWT)
Request:
```json
{
  "title": "System Design",
  "description": "Design scalable systems",
  "difficulty": "intermediate"
}
```

### `PUT /courses/:id` (Admin JWT)
Request:
```json
{
  "title": "System Design Updated",
  "description": "Updated",
  "difficulty": "advanced",
  "isPublished": true
}
```

### `DELETE /courses/:id` (Admin JWT)
Deletes course.

## Tasks

### `GET /tasks/course/:courseId` (JWT)
Returns tasks for selected course.

### `POST /tasks` (Admin JWT)
Request:
```json
{
  "courseId": 1,
  "title": "JWT Purpose",
  "prompt": "JWT is used for?",
  "questionType": "mcq",
  "options": ["auth", "css", "db"],
  "answerKey": { "correctOption": "auth" },
  "passingScore": 60,
  "maxPoints": 25
}
```

### `PUT /tasks/:id` (Admin JWT)
Updates task fields.

### `DELETE /tasks/:id` (Admin JWT)
Deletes task.

### `POST /tasks/:id/attempt` (JWT)
Request:
```json
{
  "submittedAnswers": {
    "selectedOption": "Encapsulation"
  }
}
```
Response includes score, passed flag, points awarded, updated progress.

### `GET /tasks/my-attempts` (JWT)
Returns recent attempts of current user.

## Rewards

### `GET /rewards/catalog` (JWT)
Returns available redeemable rewards.

### `POST /rewards/redeem/:rewardId` (JWT)
Redeems reward if user has enough points and stock exists.

### `GET /rewards/my-redemptions` (JWT)
Returns current user redemption history.

### `GET /rewards/config` (Admin JWT)
Returns active reward rule.

### `PUT /rewards/config` (Admin JWT)
Request:
```json
{
  "pointsPerPass": 10,
  "bonusForPerfectScore": 10,
  "streakBonusThreshold": 3,
  "streakBonusPoints": 15
}
```

## Users

### `GET /users` (Admin JWT)
Returns list of users.

### `PUT /users/:id` (Admin JWT)
Request:
```json
{
  "role": "user",
  "isActive": true
}
```

### `GET /users/me/progress` (JWT)
Returns course-wise progress for current user.
