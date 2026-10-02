const notificationsRepository = require('./repository');

// Used by other modules (orders, payments, fulfilment).
// Never throws, so a notification problem can't break an order or payment.
async function notify({ userId, type, message, orderId }) {
  try {
    return await notificationsRepository.create({ userId, type, message, orderId });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    return null;
  }
}

async function listForUser(userId) {
  return notificationsRepository.findByUser(userId);
}

async function getUnreadCount(userId) {
  return notificationsRepository.countUnread(userId);
}

async function markAsRead(notificationId, userId) {
  const updated = await notificationsRepository.markRead(notificationId, userId);
  if (!updated) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }
  return updated;
}

async function markAllAsRead(userId) {
  const count = await notificationsRepository.markAllRead(userId);
  return { updated: count };
}

module.exports = { notify, listForUser, getUnreadCount, markAsRead, markAllAsRead };