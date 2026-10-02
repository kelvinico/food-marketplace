const catalogRepository = require('./repository');

async function listProducts({ vendorId }) {
  return catalogRepository.findAll({ vendorId });
}

async function getProductById(productId) {
  return catalogRepository.findById(productId);
}

async function createProduct({ vendorId, name, description, price }) {
  if (!name || price === undefined || price === null) {
    const err = new Error('name and price are required');
    err.statusCode = 400;
    throw err;
  }

  const numericPrice = parseFloat(price);
  if (isNaN(numericPrice) || numericPrice <= 0) {
    const err = new Error('price must be a positive number');
    err.statusCode = 400;
    throw err;
  }

  return catalogRepository.create({ vendorId, name, description, price: numericPrice });
}

async function updateProduct(productId, actingUser, updates) {
  const product = await catalogRepository.findById(productId);

  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  if (product.vendor_id !== actingUser.userId) {
    const err = new Error('You can only edit your own products');
    err.statusCode = 403;
    throw err;
  }

  const allowedFields = ['name', 'description', 'price'];
  const fields = {};

  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      fields[key] = key === 'price' ? parseFloat(updates[key]) : updates[key];
    }
  }

  if (fields.price !== undefined && (isNaN(fields.price) || fields.price <= 0)) {
    const err = new Error('price must be a positive number');
    err.statusCode = 400;
    throw err;
  }

  if (Object.keys(fields).length === 0) {
    const err = new Error('No valid fields to update');
    err.statusCode = 400;
    throw err;
  }

  return catalogRepository.update(productId, fields);
}

async function removeProduct(productId, actingUser) {
  const product = await catalogRepository.findById(productId);

  if (!product) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  if (product.vendor_id !== actingUser.userId) {
    const err = new Error('You can only remove your own products');
    err.statusCode = 403;
    throw err;
  }

  return catalogRepository.setAvailability(productId, false);
}

module.exports = { listProducts, getProductById, createProduct, updateProduct, removeProduct };