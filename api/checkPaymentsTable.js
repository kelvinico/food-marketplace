require('dotenv').config();
const pool = require('./db/pool');

async function check() {
  try {
    const result = await pool.query(
      `SELECT column_name, data_type FROM information_schema.columns
       WHERE table_name = 'payments' ORDER BY ordinal_position`
    );
    console.log('PAYMENTS TABLE COLUMNS:');
    console.table(result.rows);
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    process.exit();
  }
}

check();