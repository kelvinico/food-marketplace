const pool = require('../../db/pool');

async function createOrder({ customerId, vendorId, items, total, status }) {
  const result = await pool.query(
    `INSERT INTO orders (customer_id, vendor_id, items, total, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [customerId, vendorId, JSON.stringify(items), total, status]
  );
  return result.rows[0];
}

async function findOrderById(orderId) {
  const result = await pool.query(
    `SELECT * FROM orders WHERE id = $1`,
    [orderId]
  );
  return result.rows[0] || null;
}

async function findByCustomerId(customerId) {
  const result = await pool.query(
    `SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC, id DESC`,
    [customerId]
  );
  return result.rows;
}

async function findByVendorId(vendorId) {
  const result = await pool.query(
    `SELECT * FROM orders WHERE vendor_id = $1 ORDER BY created_at DESC, id DESC`,
    [vendorId]
  );
  return result.rows;
}

module.exports = { createOrder, findOrderById, findByCustomerId, findByVendorId };