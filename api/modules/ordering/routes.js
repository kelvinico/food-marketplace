const express = require('express');
const router = express.Router();
const orderingService = require('./service');
const { requireAuth, requireRole } = require('../identity/middleware');

router.post('/', requireAuth, requireRole('customer'), async (req, res) => {
  try {
    const { vendorId, items } = req.body;
    const customerId = req.user.userId;

    if (!vendorId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'vendorId and items are required' });
    }

    const order = await orderingService.createOrder({ customerId, vendorId, items });
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const orders = await orderingService.listOrders(req.user);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const order = await orderingService.getOrderById(req.params.id, req.user);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
});

module.exports = router;