const express = require('express');
const router = express.Router();
const identityService = require('./service');

const PUBLIC_ROLES = ['customer', 'vendor'];

router.post('/signup', async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    if (role && !PUBLIC_ROLES.includes(role)) {
      return res.status(403).json({ error: 'This role cannot be created through signup' });
    }

    const result = await identityService.signup({ email, password, role, name });
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await identityService.login({ email, password });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
  }
});

module.exports = router;