require('dotenv').config();
const mod = require('./db/pool');
const pool = mod.pool || mod;

(async () => {
  try {
    const { rows } = await pool.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);
    let current = '';
    for (const r of rows) {
      if (r.table_name !== current) {
        current = r.table_name;
        console.log('\n' + current);
      }
      console.log('  ' + r.column_name + ' (' + r.data_type + ')');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
})();