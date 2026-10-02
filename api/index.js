require('dotenv').config();
const express = require('express');
const cors = require('cors');
const orderingRoutes = require('./modules/ordering/routes');
const catalogRoutes = require('./modules/catalog/routes');
const identityRoutes = require('./modules/identity/routes');
const fulfilmentRoutes = require('./modules/fulfilment/routes');
const paymentsRoutes = require('./modules/payments/routes');
const notificationsRoutes = require('./modules/notifications/routes');

const app = express();

const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  'http://localhost:5173,http://localhost:5174,http://localhost:5175'
).split(',');
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/payments', paymentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/orders', orderingRoutes);
app.use('/api/orders', fulfilmentRoutes);
app.use('/api/products', catalogRoutes);
app.use('/api/auth', identityRoutes);
app.use('/api/admin', require('./modules/admin/routes'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));