const db = require('../config/db');

const recalculateProgress = async (userId, courseId) => {
  const totalTasksQuery = 'SELECT COUNT(*)::int AS total FROM tasks WHERE course_id = $1';
  const completedTasksQuery = `
    SELECT COUNT(DISTINCT ta.task_id)::int AS completed
    FROM task_attempts ta
    JOIN tasks t ON t.id = ta.task_id
    WHERE ta.user_id = $1 AND t.course_id = $2 AND ta.passed = TRUE
  `;

  const totalTasks = (await db.query(totalTasksQuery, [courseId])).rows[0].total;
  const completedTasks = (await db.query(completedTasksQuery, [userId, courseId])).rows[0].completed;
  const completionPercent = totalTasks === 0 ? 0 : Number(((completedTasks / totalTasks) * 100).toFixed(2));

  const upsertQuery = `
    INSERT INTO progress (user_id, course_id, completed_tasks, total_tasks, completion_percent, last_activity_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (user_id, course_id)
    DO UPDATE SET
      completed_tasks = EXCLUDED.completed_tasks,
      total_tasks = EXCLUDED.total_tasks,
      completion_percent = EXCLUDED.completion_percent,
      last_activity_at = NOW()
    RETURNING *
  `;

  const { rows } = await db.query(upsertQuery, [userId, courseId, completedTasks, totalTasks, completionPercent]);
  return rows[0];
};

const getUserProgress = async (userId) => {
  const query = `
    SELECT p.id, p.course_id, c.title AS course_title, p.completed_tasks, p.total_tasks, p.completion_percent, p.last_activity_at
    FROM progress p
    JOIN courses c ON c.id = p.course_id
    WHERE p.user_id = $1
    ORDER BY p.course_id
  `;
  const { rows } = await db.query(query, [userId]);
  return rows;
};

module.exports = { recalculateProgress, getUserProgress };
