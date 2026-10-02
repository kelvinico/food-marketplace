const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const identityRepository = require('./repository');

const SALT_ROUNDS = 10;

async function signup({ email, password, role, name }) {
  if (!email || !password || !role) {
    const err = new Error('email, password, and role are required');
    err.statusCode = 400;
    throw err;
  }

  const existing = await identityRepository.findByEmail(email);
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await identityRepository.createUser({ email, passwordHash, role, name });

  const token = generateToken(user);
  return { user, token };
}

async function login({ email, password }) {
  if (!email || !password) {
    const err = new Error('email and password are required');
    err.statusCode = 400;
    throw err;
  }

  const user = await identityRepository.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user);
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
}

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = { signup, login };