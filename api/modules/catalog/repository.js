const pool = require('../../db/pool');

async function findAll({ vendorId }) {
  if (vendorId) {
    const result = await pool.query(
      `SELECT * FROM products WHERE vendor_id = $1 AND is_available = true ORDER BY id`,
      [vendorId]
    );
    return result.rows;
  }
  const result = await pool.query(
    `SELECT * FROM products WHERE is_available = true ORDER BY id`
  );
  return result.rows;
}

async function findById(productId) {
  const result = await pool.query(
    `SELECT * FROM products WHERE id = $1`,
    [productId]
  );
  return result.rows[0] || null;
}

async function create({ vendorId, name, description, price }) {
  const result = await pool.query(
    `INSERT INTO products (vendor_id, name, description, price, is_available)
     VALUES ($1, $2, $3, $4, true)
     RETURNING *`,
    [vendorId, name, description || null, price]
  );
  return result.rows[0];
}

async function update(productId, fields) {
  const setClauses = [];
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(fields)) {
    setClauses.push(`${key} = $${i}`);
    values.push(value);
    i++;
  }

  values.push(productId);

  const result = await pool.query(
    `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

async function setAvailability(productId, isAvailable) {
  const result = await pool.query(
    `UPDATE products SET is_available = $1 WHERE id = $2 RETURNING *`,
    [isAvailable, productId]
  );
  return result.rows[0] || null;
}

module.exports = { findAll, findById, create, update, setAvailability };