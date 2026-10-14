const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { validateUserRegistration, validatePasswordUpdate } = require('../middleware/validate');

// Public signup for normal users
router.post('/signup', validateUserRegistration, authController.signup);

// Universal login for all roles
router.post('/login', authController.login);

// Change password for logged-in user
router.post('/change-password', requireAuth, validatePasswordUpdate, authController.changePassword);

// Get current logged-in profile
router.get('/me', requireAuth, authController.getProfile);

module.exports = router;
