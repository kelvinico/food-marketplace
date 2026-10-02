const pool = require('../../db/pool');

async function createPayment({ orderId, reference, amount }) {
  const result = await pool.query(
    `INSERT INTO payments (order_id, reference, amount, status)
     VALUES ($1, $2, $3, 'pending')
     RETURNING *`,
    [orderId, reference, amount]
  );
  return result.rows[0];
}

async function findByReference(reference) {
  const result = await pool.query(
    `SELECT * FROM payments WHERE reference = $1`,
    [reference]
  );
  return result.rows[0] || null;
}

async function updateStatus(reference, status) {
  const result = await pool.query(
    `UPDATE payments SET status = $1 WHERE reference = $2 RETURNING *`,
    [status, reference]
  );
  return result.rows[0] || null;
}

module.exports = { createPayment, findByReference, updateStatus };