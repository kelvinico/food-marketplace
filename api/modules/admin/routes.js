const express = require('express');
const jwt = require('jsonwebtoken');
const mod = require('../../db/pool');
const pool = mod.pool || mod;

const router = express.Router();

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access only' });
    }
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

router.use(requireAdmin);

router.get('/stats', async (req, res) => {
  try {
    const users = await pool.query(
      `SELECT role, COUNT(*)::int AS count FROM users GROUP BY role`
    );
    const orders = await pool.query(
      `SELECT status, COUNT(*)::int AS count, COALESCE(SUM(total),0)::float AS total
       FROM orders GROUP BY status`
    );
    const payments = await pool.query(
      `SELECT status, COUNT(*)::int AS count, COALESCE(SUM(amount),0)::float AS total
       FROM payments GROUP BY status`
    );
    res.json({ users: users.rows, orders: orders.rows, payments: payments.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.id, o.total::float AS total, o.status, o.created_at, o.items,
              c.name AS customer_name, c.email AS customer_email,
              v.name AS vendor_name
       FROM orders o
       LEFT JOIN users c ON c.id = o.customer_id
       LEFT JOIN users v ON v.id = o.vendor_id
       ORDER BY o.created_at DESC
       LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load orders' });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, created_at
       FROM users ORDER BY created_at DESC LIMIT 500`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

router.get('/payments', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, order_id, reference, amount::float AS amount, status, created_at
       FROM payments ORDER BY created_at DESC LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load payments' });
  }
});

module.exports = router;