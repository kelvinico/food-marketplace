const orderingRepository = require('./repository');
const catalogRepository = require('../catalog/repository');
const notificationsService = require('../notifications/service');

async function createOrder({ customerId, vendorId, items }) {
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error('Order must include at least one item');
    err.statusCode = 400;
    throw err;
  }

  const itemsWithPricing = [];

  for (const item of items) {
    if (!item.productId || !item.quantity || item.quantity <= 0) {
      const err = new Error('Each item must have a productId and a positive quantity');
      err.statusCode = 400;
      throw err;
    }

    const product = await catalogRepository.findById(item.productId);

    if (!product) {
      const err = new Error(`Product ${item.productId} not found`);
      err.statusCode = 400;
      throw err;
    }

    if (!product.is_available) {
      const err = new Error(`Product "${product.name}" is currently unavailable`);
      err.statusCode = 400;
      throw err;
    }

    if (product.vendor_id !== vendorId) {
      const err = new Error(`Product "${product.name}" does not belong to vendor ${vendorId}`);
      err.statusCode = 400;
      throw err;
    }

    const unitPrice = parseFloat(product.price);
    itemsWithPricing.push({
      productId: item.productId,
      name: product.name,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    });
  }

  const total = itemsWithPricing.reduce((sum, item) => sum + item.lineTotal, 0);

  const order = await orderingRepository.createOrder({
    customerId,
    vendorId,
    items: itemsWithPricing,
    total,
    status: 'placed',
  });

  await notificationsService.notify({
    userId: customerId,
    type: 'order_placed',
    message: `Your order #${order.id} has been placed.`,
    orderId: order.id,
  });

  await notificationsService.notify({
    userId: vendorId,
    type: 'new_order',
    message: `You have a new order #${order.id}.`,
    orderId: order.id,
  });

  return order;
}

async function getOrderById(orderId, actingUser) {
  const order = await orderingRepository.findOrderById(orderId);
  if (!order) return null;

  const isOwner =
    order.customer_id === actingUser.userId || order.vendor_id === actingUser.userId;

  if (!isOwner && actingUser.role !== 'admin') {
    const err = new Error('You do not have access to this order');
    err.statusCode = 403;
    throw err;
  }

  return order;
}

async function listOrders(actingUser) {
  if (actingUser.role === 'customer') {
    return orderingRepository.findByCustomerId(actingUser.userId);
  }
  if (actingUser.role === 'vendor') {
    return orderingRepository.findByVendorId(actingUser.userId);
  }
  // admin or any other role: not scoped here yet
  return [];
}

module.exports = { createOrder, getOrderById, listOrders };