const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const env = require('../config/env');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

/**
 * Normal user self-registration
 * Note: Role is strictly locked to 'USER' on public signup
 */
async function signup(req, res, next) {
  try {
    const { name, email, address, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existing = await db.query('SELECT id FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const insertResult = await db.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, 'USER')
       RETURNING id, name, email, address, role, created_at`,
      [name.trim(), normalizedEmail, passwordHash, address.trim()]
    );

    const newUser = insertResult.rows[0];
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        address: newUser.address,
        role: newUser.role,
        createdAt: newUser.created_at
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Universal login for all roles (System Admin, Normal User, Store Owner)
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await db.query(
      'SELECT id, name, email, password_hash, address, role, created_at FROM users WHERE LOWER(email) = $1',
      [normalizedEmail]
    );

    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Password update for logged-in user
 */
async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const userResult = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    const currentHash = userResult.rows[0].password_hash;
    const isOldMatch = await bcrypt.compare(oldPassword, currentHash);

    if (!isOldMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password provided.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newHash, userId]
    );

    return res.json({
      success: true,
      message: 'Password updated successfully.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Fetch current authenticated user profile
 */
async function getProfile(req, res) {
  return res.json({
    success: true,
    user: req.user
  });
}

module.exports = {
  signup,
  login,
  changePassword,
  getProfile
};
