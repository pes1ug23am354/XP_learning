-- Reward-Based Learning Platform PostgreSQL schema

DROP TABLE IF EXISTS reward_redemptions CASCADE;
DROP TABLE IF EXISTS progress CASCADE;
DROP TABLE IF EXISTS task_attempts CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS rewards_catalog CASCADE;
DROP TABLE IF EXISTS reward_rules CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  points_balance INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  difficulty VARCHAR(20) NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE course_enrollments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  prompt TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'true_false', 'short_answer')),
  options JSONB,
  answer_key JSONB NOT NULL,
  passing_score INTEGER NOT NULL DEFAULT 60,
  max_points INTEGER NOT NULL DEFAULT 20,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE reward_rules (
  id SERIAL PRIMARY KEY,
  rule_name VARCHAR(100) NOT NULL,
  points_per_pass INTEGER NOT NULL DEFAULT 10,
  bonus_for_perfect_score INTEGER NOT NULL DEFAULT 10,
  streak_bonus_threshold INTEGER NOT NULL DEFAULT 3,
  streak_bonus_points INTEGER NOT NULL DEFAULT 15,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE task_attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  submitted_answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  attempted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  total_tasks INTEGER NOT NULL DEFAULT 0,
  completion_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMP,
  UNIQUE(user_id, course_id)
);

CREATE TABLE rewards_catalog (
  id SERIAL PRIMARY KEY,
  title VARCHAR(140) NOT NULL,
  description TEXT,
  points_cost INTEGER NOT NULL CHECK (points_cost > 0),
  stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE reward_redemptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_id INTEGER NOT NULL REFERENCES rewards_catalog(id) ON DELETE RESTRICT,
  points_spent INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'rejected', 'pending')),
  redeemed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO users (full_name, email, password_hash, role) VALUES
('Admin User', 'admin@rewardlearn.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
('Priya Student', 'priya@rewardlearn.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user');

INSERT INTO courses (title, description, difficulty, created_by) VALUES
('Object-Oriented Analysis Basics', 'Learn OOAD fundamentals and diagrams.', 'beginner', 1),
('Full-Stack JavaScript', 'Build production grade REST and React apps.', 'intermediate', 1);

INSERT INTO course_enrollments (user_id, course_id) VALUES
(2, 1),
(2, 2);

INSERT INTO tasks (course_id, title, prompt, question_type, options, answer_key, passing_score, max_points, created_by) VALUES
(
  1,
  'Identify Encapsulation',
  'Which OOP principle hides internal state and exposes behavior through methods?',
  'mcq',
  '["Abstraction", "Encapsulation", "Inheritance", "Polymorphism"]',
  '{"correctOption": "Encapsulation"}',
  60,
  20,
  1
),
(
  2,
  'JWT Purpose',
  'JWT is commonly used for stateless ____?',
  'mcq',
  '["authorization and authentication", "image processing", "CSS animations", "file compression"]',
  '{"correctOption": "authorization and authentication"}',
  60,
  25,
  1
);

INSERT INTO reward_rules (rule_name, points_per_pass, bonus_for_perfect_score, streak_bonus_threshold, streak_bonus_points, is_active, updated_by)
VALUES ('Default Rule', 10, 10, 3, 15, TRUE, 1);

INSERT INTO rewards_catalog (title, description, points_cost, stock, is_active) VALUES
('Coffee Voucher', 'Redeem a coffee voucher', 30, 50, TRUE),
('Premium Course Access', 'Unlock one premium course for a month', 80, 20, TRUE);

-- Example progress and attempt
INSERT INTO task_attempts (user_id, task_id, submitted_answers, score, passed, points_awarded)
VALUES (2, 1, '{"selectedOption":"Encapsulation"}', 100, TRUE, 20);

INSERT INTO progress (user_id, course_id, completed_tasks, total_tasks, completion_percent, last_activity_at)
VALUES (2, 1, 1, 1, 100.00, NOW());
