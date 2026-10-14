const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const db = require('./config/db');

// Route modules
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const storeRoutes = require('./routes/stores');
const ratingRoutes = require('./routes/ratings');
const ownerRoutes = require('./routes/owner');

const app = express();

// Security and utility middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    dbEngine: db.isPostgres() ? 'PostgreSQL' : 'SQLite (WASM)'
  });
});

// API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/owner', ownerRoutes);

// 404 handler for unknown routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Global centralized error boundary
app.use((err, req, res, next) => {
  console.error('[Error Boundary]', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start listening if run directly
if (require.main === module) {
  app.listen(env.PORT, async () => {
    console.log(`====================================================`);
    console.log(`  Store Rating Portal API running on port ${env.PORT} `);
    console.log(`  Environment: ${env.NODE_ENV}                       `);
    console.log(`====================================================`);
    await db.getDb();
  });
}

module.exports = app;
