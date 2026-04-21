const db = require('../config/db');

const listTasksByCourse = async (courseId) => {
  const query = `
    SELECT id, course_id, title, prompt, question_type, options, passing_score, max_points
    FROM tasks
    WHERE course_id = $1
    ORDER BY id
  `;
  const { rows } = await db.query(query, [courseId]);
  return rows;
};

const getTaskById = async (taskId) => {
  const query = `
    SELECT id, course_id, title, prompt, question_type, options, answer_key, passing_score, max_points
    FROM tasks
    WHERE id = $1
  `;
  const { rows } = await db.query(query, [taskId]);
  return rows[0];
};

const createTask = async ({ courseId, title, prompt, questionType, options, answerKey, passingScore, maxPoints, createdBy }) => {
  const query = `
    INSERT INTO tasks (course_id, title, prompt, question_type, options, answer_key, passing_score, max_points, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;
  const values = [courseId, title, prompt, questionType, options, answerKey, passingScore, maxPoints, createdBy];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const updateTask = async (id, { title, prompt, questionType, options, answerKey, passingScore, maxPoints }) => {
  const query = `
    UPDATE tasks
    SET title = $2,
        prompt = $3,
        question_type = $4,
        options = $5,
        answer_key = $6,
        passing_score = $7,
        max_points = $8,
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const values = [id, title, prompt, questionType, options, answerKey, passingScore, maxPoints];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const deleteTask = async (id) => {
  await db.query('DELETE FROM tasks WHERE id = $1', [id]);
};

const createAttempt = async ({ userId, taskId, submittedAnswers, score, passed, pointsAwarded }) => {
  const query = `
    INSERT INTO task_attempts (user_id, task_id, submitted_answers, score, passed, points_awarded)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const values = [userId, taskId, submittedAnswers, score, passed, pointsAwarded];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const getLatestAttemptsByUser = async (userId, limit = 10) => {
  const query = `
    SELECT ta.id, ta.task_id, t.title AS task_title, ta.score, ta.passed, ta.points_awarded, ta.attempted_at
    FROM task_attempts ta
    JOIN tasks t ON t.id = ta.task_id
    WHERE ta.user_id = $1
    ORDER BY ta.attempted_at DESC
    LIMIT $2
  `;
  const { rows } = await db.query(query, [userId, limit]);
  return rows;
};

const getUserPassStreak = async (userId) => {
  const query = `
    SELECT passed
    FROM task_attempts
    WHERE user_id = $1
    ORDER BY attempted_at DESC
    LIMIT 20
  `;
  const { rows } = await db.query(query, [userId]);

  let streak = 0;
  for (const row of rows) {
    if (row.passed) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
};

module.exports = {
  listTasksByCourse,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  createAttempt,
  getLatestAttemptsByUser,
  getUserPassStreak,
};
