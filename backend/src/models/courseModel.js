const db = require('../config/db');

const listCourses = async () => {
  const query = `
    SELECT c.id, c.title, c.description, c.difficulty, c.is_published,
           u.full_name AS created_by_name,
           COUNT(t.id)::int AS task_count
    FROM courses c
    LEFT JOIN users u ON c.created_by = u.id
    LEFT JOIN tasks t ON t.course_id = c.id
    GROUP BY c.id, u.full_name
    ORDER BY c.id
  `;
  const { rows } = await db.query(query);
  return rows;
};

const createCourse = async ({ title, description, difficulty, createdBy }) => {
  const query = `
    INSERT INTO courses (title, description, difficulty, created_by)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const { rows } = await db.query(query, [title, description, difficulty, createdBy]);
  return rows[0];
};

const updateCourse = async (id, { title, description, difficulty, isPublished }) => {
  const query = `
    UPDATE courses
    SET title = $2,
        description = $3,
        difficulty = $4,
        is_published = $5,
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const { rows } = await db.query(query, [id, title, description, difficulty, isPublished]);
  return rows[0];
};

const deleteCourse = async (id) => {
  await db.query('DELETE FROM courses WHERE id = $1', [id]);
};

module.exports = { listCourses, createCourse, updateCourse, deleteCourse };
