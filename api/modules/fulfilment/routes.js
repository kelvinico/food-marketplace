const express = require('express');
const router = express.Router();
const fulfilmentService = require('./service');
const { requireAuth } = require('../identity/middleware');

router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }
    const updatedOrder = await fulfilmentService.transition(req.params.id, status, req.user);
    res.json(updatedOrder);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
});

router.get('/:id/history', requireAuth, async (req, res) => {
  try {
    const history = await fulfilmentService.getHistory(req.params.id, req.user);
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
});

module.exports = router;