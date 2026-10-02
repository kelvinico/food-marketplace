require('dotenv').config();
const pool = require('./db/pool');

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id),
        reference VARCHAR(100) UNIQUE NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('payments table created (or already existed)');
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    process.exit();
  }
}

run();