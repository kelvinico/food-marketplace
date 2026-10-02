const pool = require('../../db/pool');

async function updateOrderStatus(orderId, newStatus) {
  const result = await pool.query(
    `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
    [newStatus, orderId]
  );
  return result.rows[0] || null;
}

async function recordStatusChange(orderId, status) {
  await pool.query(
    `INSERT INTO order_status_history (order_id, status) VALUES ($1, $2)`,
    [orderId, status]
  );
}

async function findOrderById(orderId) {
  const result = await pool.query(`SELECT * FROM orders WHERE id = $1`, [orderId]);
  return result.rows[0] || null;
}

async function getStatusHistory(orderId) {
  const result = await pool.query(
    `SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY changed_at ASC`,
    [orderId]
  );
  return result.rows;
}

module.exports = { updateOrderStatus, recordStatusChange, findOrderById, getStatusHistory };