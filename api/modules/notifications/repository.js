const pool = require('../../db/pool');

async function create({ userId, type, message, orderId }) {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, type, message, order_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, type, message, orderId || null]
  );
  return result.rows[0];
}

async function findByUser(userId) {
  const result = await pool.query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC, id DESC`,
    [userId]
  );
  return result.rows;
}

async function countUnread(userId) {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return result.rows[0].count;
}

async function markRead(notificationId, userId) {
  const result = await pool.query(
    `UPDATE notifications SET is_read = true
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [notificationId, userId]
  );
  return result.rows[0] || null;
}

async function markAllRead(userId) {
  const result = await pool.query(
    `UPDATE notifications SET is_read = true
     WHERE user_id = $1 AND is_read = false`,
    [userId]
  );
  return result.rowCount;
}

module.exports = { create, findByUser, countUnread, markRead, markAllRead };