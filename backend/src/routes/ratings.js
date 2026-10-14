const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');

// Normal users can submit or modify ratings for stores
router.post('/:storeId', requireAuth, requireRole('USER'), ratingController.submitOrUpdateRating);

module.exports = router;
