const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// Store Owner dashboard: average rating and rater listing
router.get('/dashboard', requireAuth, requireRole('STORE_OWNER'), ownerController.getOwnerDashboard);

module.exports = router;
