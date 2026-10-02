const express = require('express');
const router = express.Router();
const notificationsService = require('./service');
const { requireAuth } = require('../identity/middleware');

router.get('/', requireAuth, async (req, res) => {
  try {
    const notifications = await notificationsService.listForUser(req.user.userId);
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const count = await notificationsService.getUnreadCount(req.user.userId);
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    const result = await notificationsService.markAllAsRead(req.user.userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const notification = await notificationsService.markAsRead(req.params.id, req.user.userId);
    res.json(notification);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
});

module.exports = router;