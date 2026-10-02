const fulfilmentRepository = require('./repository');
const notificationsService = require('../notifications/service');

const VALID_TRANSITIONS = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
};

const TRANSITION_PERMISSIONS = {
  confirmed: ['vendor'],
  preparing: ['vendor'],
  out_for_delivery: ['vendor'],
  delivered: ['vendor'],
  cancelled: ['customer', 'vendor'],
};

async function transition(orderId, newStatus, actingUser) {
  const order = await fulfilmentRepository.findOrderById(orderId);

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  const currentStatus = order.status;
  const allowedNextStates = VALID_TRANSITIONS[currentStatus] || [];

  if (!allowedNextStates.includes(newStatus)) {
    const err = new Error(
      `Cannot move order from "${currentStatus}" to "${newStatus}". Allowed: ${allowedNextStates.join(', ') || 'none'}`
    );
    err.statusCode = 400;
    throw err;
  }

  const allowedRoles = TRANSITION_PERMISSIONS[newStatus] || [];
  if (!allowedRoles.includes(actingUser.role)) {
    const err = new Error(`Only ${allowedRoles.join(' or ')} can set status to "${newStatus}"`);
    err.statusCode = 403;
    throw err;
  }

  if (actingUser.role === 'customer' && order.customer_id !== actingUser.userId) {
    const err = new Error('You can only cancel your own orders');
    err.statusCode = 403;
    throw err;
  }

  if (actingUser.role === 'vendor' && order.vendor_id !== actingUser.userId) {
    const err = new Error('You can only manage orders for your own vendor account');
    err.statusCode = 403;
    throw err;
  }

  const updatedOrder = await fulfilmentRepository.updateOrderStatus(orderId, newStatus);
  await fulfilmentRepository.recordStatusChange(orderId, newStatus);

  const recipientId =
    actingUser.role === 'customer' ? order.vendor_id : order.customer_id;

  await notificationsService.notify({
    userId: recipientId,
    type: 'order_status',
    message: `Order #${orderId} is now ${newStatus.replace(/_/g, ' ')}.`,
    orderId: Number(orderId),
  });

  return updatedOrder;
}

async function getHistory(orderId, actingUser) {
  const order = await fulfilmentRepository.findOrderById(orderId);

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  const isOwner =
    order.customer_id === actingUser.userId || order.vendor_id === actingUser.userId;

  if (!isOwner && actingUser.role !== 'admin') {
    const err = new Error('You do not have access to this order');
    err.statusCode = 403;
    throw err;
  }

  return fulfilmentRepository.getStatusHistory(orderId);
}

module.exports = { transition, getHistory };