const axios = require('axios');
const crypto = require('crypto');
const paymentsRepository = require('./repository');
const orderingRepository = require('../ordering/repository');

const FLW_BASE_URL = 'https://api.flutterwave.com/v3';

async function initializePayment({ orderId, actingUser }) {
  const order = await orderingRepository.findOrderById(orderId);

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  if (order.customer_id !== actingUser.userId) {
    const err = new Error('You can only pay for your own orders');
    err.statusCode = 403;
    throw err;
  }

  const reference = `order_${orderId}_${crypto.randomBytes(6).toString('hex')}`;

  const response = await axios.post(
    `${FLW_BASE_URL}/payments`,
    {
      tx_ref: reference,
      amount: order.total,
      currency: 'NGN',
      redirect_url: 'http://localhost:4000/api/payments/callback',
      customer: {
        email: actingUser.email || 'customer@example.com',
      },
      customizations: {
        title: 'Bankyloolas Marketplace',
        description: `Payment for order #${orderId}`,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
    }
  );

  await paymentsRepository.createPayment({
    orderId,
    reference,
    amount: order.total,
  });

  return {
    checkoutUrl: response.data.data.link,
    reference,
  };
}

async function verifyPayment(reference) {
  const payment = await paymentsRepository.findByReference(reference);

  if (!payment) {
    const err = new Error('Payment record not found');
    err.statusCode = 404;
    throw err;
  }

  const response = await axios.get(
    `${FLW_BASE_URL}/transactions/verify_by_reference?tx_ref=${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
    }
  );

  const flwStatus = response.data.data.status;
  const newStatus = flwStatus === 'successful' ? 'success' : 'failed';

  const updated = await paymentsRepository.updateStatus(reference, newStatus);
  return updated;
}

module.exports = { initializePayment, verifyPayment };