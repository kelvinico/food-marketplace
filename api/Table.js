require('dotenv').config();
const pool = require('./db/pool');

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        order_id INTEGER REFERENCES orders(id),
        is_read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('notifications table created (or already existed)');
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    process.exit();
  }
}

run();