const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { validateUserRegistration, validateStoreCreation } = require('../middleware/validate');

// All admin routes require authenticated ADMIN role
router.use(requireAuth, requireRole('ADMIN'));

// Dashboard stats: total users, stores, ratings
router.get('/stats', adminController.getDashboardStats);

// Add new normal, admin, or store owner user
router.post('/users', validateUserRegistration, adminController.addUser);

// Add new store
router.post('/stores', validateStoreCreation, adminController.addStore);

// View list of all users with search, role filter, sorting, and store rating
router.get('/users', adminController.getUsers);

// View list of all stores with search, overall rating, and sorting
router.get('/stores', adminController.getStores);

module.exports = router;
