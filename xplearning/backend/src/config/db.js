const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const testConnection = async () => {
  await pool.query('SELECT 1');
  console.log('PostgreSQL connected');
};

module.exports = { pool, testConnection };
