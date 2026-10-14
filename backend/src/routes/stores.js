const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const storeController = require('../controllers/storeController');
const env = require('../config/env');
const db = require('../config/db');

// Optional auth middleware: extracts user if token present, but doesn't block if missing
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const userRes = await db.query('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.id]);
      if (userRes.rows.length > 0) {
        req.user = userRes.rows[0];
      }
    } catch {
      // Ignore token decode failure on optional routes
    }
  }
  next();
}

// Store catalog listing with search, sorting, and user submitted rating
router.get('/', optionalAuth, storeController.getStoreCatalog);

module.exports = router;
