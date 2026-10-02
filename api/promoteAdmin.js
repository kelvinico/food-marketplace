require('dotenv').config();
const mod = require('./db/pool');
const pool = mod.pool || mod;

(async () => {
  const email = process.argv[2];
  if (!email) {
    console.log('Usage: node promoteAdmin.js your@email.com');
    process.exit(1);
  }
  try {
    const { rows } = await pool.query(
      `UPDATE users SET role = 'admin' WHERE email = $1 RETURNING id, email, role`,
      [email]
    );
    console.log(rows.length ? rows[0] : 'No user found with that email');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
})();