require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const chapters = [
  {
    title: 'Light - Reflection and Refraction',
    summary: 'Understand how light behaves in mirrors and lenses.',
    topics: ['Nature of Light and Reflection', 'Laws of Reflection', 'Image Formation by Plane Mirrors', 'Refraction Through Glass Slab', 'Lenses and Image Formation'],
  },
  {
    title: 'Human Eye and the Colourful World',
    summary: 'Explore vision, defects, and atmospheric optical phenomena.',
    topics: ['Structure of Human Eye', 'Defects of Vision', 'Dispersion of Light', 'Scattering of Light', 'Atmospheric Optical Effects'],
  },
  {
    title: 'Electricity',
    summary: 'Learn current, potential, resistance and practical circuits.',
    topics: ['Electric Current and Charge', 'Potential Difference and Circuit', 'Ohm Law', 'Resistance and Resistivity', 'Electric Power and Energy'],
  },
  {
    title: 'Magnetic Effects of Electric Current',
    summary: 'Understand magnetic fields, motors, and generators.',
    topics: ['Magnetic Field and Field Lines', 'Field Due to Current Carrying Conductor', 'Force on Current in Magnetic Field', 'Electric Motor', 'Electromagnetic Induction and Generator'],
  },
];

const makeContent = (topicTitle, chapterTitle) => ({
  intro: `Welcome to ${topicTitle}. This mission inside ${chapterTitle} blends conceptual understanding, formula intelligence, and board-style problem solving.`,
  sections: [
    {
      heading: 'Concept Layer',
      body: `${topicTitle} should first be understood physically, then represented mathematically. This avoids blind formula substitution and improves transfer to unfamiliar questions.`,
      keyPoints: ['Always state the governing principle first.', 'Identify conditions where the principle applies.', 'Map observable behavior to scientific terms.'],
    },
    {
      heading: 'Formula Layer',
      body: 'Before calculation, analyze variable relationships and dimensions. Correct physics reasoning must remain valid even before numbers are substituted.',
      keyPoints: ['Track SI units throughout.', 'Check proportional trends before computing.', 'Use dimensional sanity checks for final confidence.'],
    },
    {
      heading: 'Application Layer',
      body: 'Work through one realistic exam scenario by converting language to symbols, selecting a strategy, and validating the result in context.',
      keyPoints: ['Extract knowns/unknowns clearly.', 'Avoid skipping intermediate reasoning.', 'Interpret result physically, not only numerically.'],
    },
    {
      heading: 'Exam Precision',
      body: 'In board exams, structured method earns marks. Include statement, law, substitution, and final inference with units.',
      keyPoints: ['Use concise derivation style.', 'Draw diagrams where conceptually needed.', 'Conclude with a meaning-rich final line.'],
    },
  ],
  summary: `You now have mastery foundations for ${topicTitle}. Proceed to quiz to validate readiness and unlock progression.`,
});

const conceptTemplates = [
  {
    stem: (topic, n) => `${topic}: In an exam-style scenario ${n}, which statement correctly applies the governing principle under valid assumptions?`,
    options: [
      'Apply the relevant law only after checking boundary conditions and unit consistency.',
      'Apply any memorized formula regardless of initial constraints.',
      'Ignore assumptions if the numerical result appears reasonable.',
      'Use dimensions only at the final step after all substitutions.',
    ],
    answerIndex: 0,
    explanation: 'Correct physics reasoning begins with assumptions and principle validity, not formula recall alone.',
  },
  {
    stem: (topic, n) => `${topic}: During level check ${n}, a learner switches to a different equation midway. What is the best correction?`,
    options: [
      'Re-derive from the same physical condition and maintain one coherent model.',
      'Blend multiple equations from different conditions for faster answers.',
      'Replace symbols with values first and infer principle later.',
      'Choose the equation with more variables to appear rigorous.',
    ],
    answerIndex: 0,
    explanation: 'A coherent physical model should remain consistent through derivation and computation.',
  },
  {
    stem: (topic, n) => `${topic}: For challenge item ${n}, which option best reflects correct exam communication?`,
    options: [
      'State principle, show substitutions with units, and conclude with interpretation.',
      'Write only the final numerical answer to save time.',
      'Skip units if calculations are correct.',
      'Use theoretical text without linking to the given data.',
    ],
    answerIndex: 0,
    explanation: 'Structured communication earns accuracy and marks in board-level responses.',
  },
  {
    stem: (topic, n) => `${topic}: A result contradicts expected physical behavior. What should be done first?`,
    options: [
      'Audit assumptions, sign conventions, and unit conversions before re-solving.',
      'Trust calculator output if arithmetic has no syntax errors.',
      'Round aggressively to hide discrepancy.',
      'Switch to a different chapter formula immediately.',
    ],
    answerIndex: 0,
    explanation: 'Physical inconsistency is usually due to assumption or unit errors, not just arithmetic.',
  },
  {
    stem: (topic, n) => `${topic}: In mission question ${n}, what most improves conceptual accuracy?`,
    options: [
      'Link each symbol and equation term to a measurable physical quantity.',
      'Memorize solved examples without checking why each step works.',
      'Assume direct proportionality in all situations.',
      'Prioritize speed over conceptual checks in first attempts.',
    ],
    answerIndex: 0,
    explanation: 'Meaningful symbol interpretation prevents conceptual and application errors.',
  },
];

const makeQuestionBank = (topicKey) => {
  const bank = [];
  for (let i = 0; i < 45; i += 1) {
    const template = conceptTemplates[i % conceptTemplates.length];
    bank.push({
      id: `${topicKey.replace(/\s+/g, '-').toLowerCase()}-q${i + 1}`,
      prompt: template.stem(topicKey, i + 1),
      options: template.options,
      answerIndex: template.answerIndex,
      explanation: template.explanation,
    });
  }
  return bank;
};

const makeChallengeQuestions = (chapterTitle, count = 30) => {
  const questions = [];
  for (let i = 1; i <= count; i += 1) {
    questions.push({
      id: `${chapterTitle.replace(/\s+/g, '-').toLowerCase()}-challenge-${i}`,
      prompt: `${chapterTitle} challenge ${i}: which approach preserves conceptual integrity and exam-grade method?`,
      options: [
        'Use law-consistent reasoning, valid assumptions, and unit-checked substitution.',
        'Memorize outputs from previous solved examples and reuse blindly.',
        'Combine unrelated chapter equations to reach a faster numeric answer.',
        'Prefer approximation before checking physical feasibility.',
      ],
      answerIndex: 0,
      explanation: 'Integrated and assumption-aware reasoning is required for chapter-level mastery.',
    });
  }
  return questions;
};

const ddl = `
DROP TABLE IF EXISTS tickets, xp_logs, quiz_attempts, quiz_sessions, chapter_progress, topic_progress, enrollments, topics, chapters, subjects, users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('learner','admin')),
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak_current INTEGER NOT NULL DEFAULT 0,
  streak_longest INTEGER NOT NULL DEFAULT 0,
  streak_last_active DATE,
  last_topic_id INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  board VARCHAR(60) NOT NULL,
  class_level VARCHAR(60) NOT NULL,
  description TEXT NOT NULL,
  cover_gradient VARCHAR(120) NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE chapters (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  chapter_order INTEGER NOT NULL,
  summary TEXT NOT NULL,
  challenge_questions JSONB NOT NULL,
  challenge_pass_score INTEGER NOT NULL DEFAULT 70,
  challenge_xp_reward INTEGER NOT NULL DEFAULT 300
);

CREATE TABLE topics (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title VARCHAR(180) NOT NULL,
  topic_order INTEGER NOT NULL,
  estimated_minutes INTEGER NOT NULL DEFAULT 20,
  content JSONB NOT NULL,
  quiz_questions JSONB NOT NULL,
  quiz_pass_score INTEGER NOT NULL DEFAULT 60,
  quiz_xp_base INTEGER NOT NULL DEFAULT 120,
  is_published BOOLEAN NOT NULL DEFAULT TRUE
);

ALTER TABLE users ADD CONSTRAINT fk_last_topic FOREIGN KEY (last_topic_id) REFERENCES topics(id) ON DELETE SET NULL;

CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  attempted_questions INTEGER NOT NULL DEFAULT 0,
  correct_questions INTEGER NOT NULL DEFAULT 0,
  accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
  UNIQUE(user_id, subject_id)
);

CREATE TABLE topic_progress (
  id SERIAL PRIMARY KEY,
  enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  unlocked BOOLEAN NOT NULL DEFAULT FALSE,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(enrollment_id, topic_id)
);

CREATE TABLE chapter_progress (
  id SERIAL PRIMARY KEY,
  enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  challenge_cleared BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(enrollment_id, chapter_id)
);

CREATE TABLE quiz_sessions (
  id SERIAL PRIMARY KEY,
  session_token VARCHAR(120) NOT NULL UNIQUE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  question_set JSONB NOT NULL,
  consumed BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  correct_count INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  accuracy NUMERIC(5,2) NOT NULL,
  passed BOOLEAN NOT NULL,
  xp_awarded INTEGER NOT NULL DEFAULT 0,
  speed_bonus INTEGER NOT NULL DEFAULT 0,
  streak_bonus INTEGER NOT NULL DEFAULT 0,
  perfect_bonus INTEGER NOT NULL DEFAULT 0,
  duration_sec INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE xp_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_type VARCHAR(30) NOT NULL,
  source_id INTEGER,
  xp INTEGER NOT NULL,
  details TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('bug','content','account','other')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low','medium','high')),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
  user_message TEXT NOT NULL,
  admin_reply TEXT,
  admin_replied_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  replied_at TIMESTAMP,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

const run = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(ddl);

    const adminHash = await bcrypt.hash('admin12345', 10);
    const learnerHash = await bcrypt.hash('learner12345', 10);

    await client.query(
      `INSERT INTO users (full_name, email, password_hash, role) VALUES
      ('XPLearning Admin', 'admin@xplearning.com', $1, 'admin'),
      ('Aarav Learner', 'learner@xplearning.com', $2, 'learner')`,
      [adminHash, learnerHash]
    );

    const subjectRes = await client.query(
      `INSERT INTO subjects (title, board, class_level, description, cover_gradient)
       VALUES ('Physics','CBSE','Class 10','Gamified CBSE Class 10 Physics journey with immersive missions and mastery checkpoints.','from-orange-500 via-orange-400 to-blue-900') RETURNING id`
    );
    const subjectId = subjectRes.rows[0].id;

    for (let ci = 0; ci < chapters.length; ci += 1) {
      const chapter = chapters[ci];
      const chapterRes = await client.query(
        `INSERT INTO chapters (subject_id, title, chapter_order, summary, challenge_questions, challenge_pass_score, challenge_xp_reward)
         VALUES ($1,$2,$3,$4,$5::jsonb,70,300) RETURNING id`,
        [subjectId, chapter.title, ci + 1, chapter.summary, JSON.stringify(makeChallengeQuestions(chapter.title, 30))]
      );
      const chapterId = chapterRes.rows[0].id;

      for (let ti = 0; ti < chapter.topics.length; ti += 1) {
        const topicTitle = chapter.topics[ti];
        await client.query(
          `INSERT INTO topics (chapter_id, title, topic_order, estimated_minutes, content, quiz_questions, quiz_pass_score, quiz_xp_base)
           VALUES ($1,$2,$3,20,$4::jsonb,$5::jsonb,60,120)`,
          [chapterId, topicTitle, ti + 1, JSON.stringify(makeContent(topicTitle, chapter.title)), JSON.stringify(makeQuestionBank(topicTitle))]
        );
      }
    }

    const learner = (await client.query(`SELECT id FROM users WHERE email='learner@xplearning.com'`)).rows[0];
    const enrollmentRes = await client.query(`INSERT INTO enrollments (user_id, subject_id) VALUES ($1,$2) RETURNING id`, [learner.id, subjectId]);
    const enrollmentId = enrollmentRes.rows[0].id;

    const topicRows = (await client.query(
      `SELECT t.id, c.id AS chapter_id, c.chapter_order, t.topic_order
       FROM topics t JOIN chapters c ON t.chapter_id=c.id
       WHERE c.subject_id=$1 ORDER BY c.chapter_order, t.topic_order`,
      [subjectId]
    )).rows;

    const chapterRows = (await client.query('SELECT id FROM chapters WHERE subject_id=$1 ORDER BY chapter_order', [subjectId])).rows;

    for (const ch of chapterRows) {
      await client.query('INSERT INTO chapter_progress (enrollment_id, chapter_id, completed, challenge_cleared) VALUES ($1,$2,FALSE,FALSE)', [enrollmentId, ch.id]);
    }

    for (const t of topicRows) {
      const unlocked = t.chapter_order === 1 && t.topic_order === 1;
      await client.query('INSERT INTO topic_progress (enrollment_id, topic_id, unlocked, is_read, completed) VALUES ($1,$2,$3,FALSE,FALSE)', [enrollmentId, t.id, unlocked]);
    }

    await client.query(
      `INSERT INTO tickets (user_id, title, category, priority, status, user_message)
       VALUES ($1,'Need help with chapter challenge','content','medium','open',
       'I passed most topic quizzes but need strategy to improve chapter challenge consistency.')`,
      [learner.id]
    );

    await client.query('COMMIT');
    console.log('Seed completed successfully.');
    console.log('Admin: admin@xplearning.com / admin12345');
    console.log('Learner: learner@xplearning.com / learner12345');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

run();
