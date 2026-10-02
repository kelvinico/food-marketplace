const express = require('express');
const router = express.Router();
const paymentsService = require('./service');
const { requireAuth } = require('../identity/middleware');

router.post('/initialize', requireAuth, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }
    const result = await paymentsService.initializePayment({
      orderId,
      actingUser: req.user,
    });
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
});

router.get('/verify/:reference', requireAuth, async (req, res) => {
  try {
    const result = await paymentsService.verifyPayment(req.params.reference);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
});

module.exports = router;