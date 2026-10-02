const express = require('express');
const router = express.Router();
const catalogService = require('./service');
const { requireAuth, requireRole } = require('../identity/middleware');

router.get('/', async (req, res) => {
  try {
    const { vendorId } = req.query;
    const products = await catalogService.listProducts({ vendorId });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await catalogService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post('/', requireAuth, requireRole('vendor'), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const product = await catalogService.createProduct({
      vendorId: req.user.userId,
      name,
      description,
      price,
    });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
});

router.patch('/:id', requireAuth, requireRole('vendor'), async (req, res) => {
  try {
    const product = await catalogService.updateProduct(req.params.id, req.user, req.body);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
});

router.delete('/:id', requireAuth, requireRole('vendor'), async (req, res) => {
  try {
    const product = await catalogService.removeProduct(req.params.id, req.user);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
});

module.exports = router;