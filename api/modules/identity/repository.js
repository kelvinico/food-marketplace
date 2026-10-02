const pool = require('../../db/pool');

async function createUser({ email, passwordHash, role, name }) {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, role, name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, role, name, created_at`,
    [email, passwordHash, role, name]
  );
  return result.rows[0];
}

async function findByEmail(email) {
  const result = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );
  return result.rows[0] || null;
}

async function findById(userId) {
  const result = await pool.query(
    `SELECT id, email, role, name, created_at FROM users WHERE id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}

module.exports = { createUser, findByEmail, findById };