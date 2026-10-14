const db = require('../config/db');

/**
 * Store Owner Dashboard
 * Displays:
 * 1. Average rating of their assigned store
 * 2. List of users who submitted ratings for their store (with sorting & filtering)
 */
async function getOwnerDashboard(req, res, next) {
  try {
    const ownerId = req.user.id;
    const { search, sortBy = 'rating', sortOrder = 'desc' } = req.query;

    // Find the store owned by this user
    const storeResult = await db.query(
      `SELECT id, name, email, address, created_at
       FROM stores
       WHERE owner_id = $1
       LIMIT 1`,
      [ownerId]
    );

    if (!storeResult.rows || storeResult.rows.length === 0) {
      return res.json({
        success: true,
        hasStore: false,
        message: 'No store is currently associated with your store owner account.',
        store: null,
        averageRating: 0,
        totalRatings: 0,
        raters: []
      });
    }

    const store = storeResult.rows[0];

    // Compute store overall stats
    const statsResult = await db.query(
      `SELECT
         ROUND(AVG(rating), 2) AS avg_rating,
         COUNT(id) AS total_count
       FROM ratings
       WHERE store_id = $1`,
      [store.id]
    );

    const avgRating = statsResult.rows[0]?.avg_rating !== null ? Number(statsResult.rows[0]?.avg_rating) : 0;
    const totalCount = Number(statsResult.rows[0]?.total_count || 0);

    // Fetch list of users who submitted ratings
    let ratersSql = `
      SELECT
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.address AS user_address,
        r.rating,
        r.created_at,
        r.updated_at
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
    `;

    const params = [store.id];

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      const pIdx = params.length;
      ratersSql += ` AND (LOWER(u.name) LIKE $${pIdx} OR LOWER(u.email) LIKE $${pIdx} OR LOWER(u.address) LIKE $${pIdx})`;
    }

    const validSortFields = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      rating: 'r.rating',
      date: 'r.updated_at'
    };

    const sortCol = validSortFields[sortBy.toLowerCase()] || 'r.updated_at';
    const direction = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    ratersSql += ` ORDER BY ${sortCol} ${direction}`;

    const ratersResult = await db.query(ratersSql, params);

    return res.json({
      success: true,
      hasStore: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address
      },
      averageRating: avgRating,
      totalRatings: totalCount,
      raters: ratersResult.rows.map((row) => ({
        userId: row.user_id,
        userName: row.user_name,
        userEmail: row.user_email,
        userAddress: row.user_address,
        rating: row.rating,
        submittedAt: row.created_at,
        modifiedAt: row.updated_at
      }))
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOwnerDashboard
};
