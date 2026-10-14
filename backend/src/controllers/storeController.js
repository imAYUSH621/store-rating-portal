const db = require('../config/db');

/**
 * List stores for normal users and catalog view.
 * Displays overall rating AND the requesting user's submitted rating (if logged in).
 * Supports search by name and address, plus sorting.
 */
async function getStoreCatalog(req, res, next) {
  try {
    const userId = req.user ? req.user.id : null;
    const { search, name, address, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const params = [];
    let userJoin = '';

    if (userId) {
      params.push(userId);
      userJoin = `LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $1`;
    }

    let sql = `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        ROUND(AVG(r.rating), 2) AS overall_rating,
        COUNT(r.id) AS total_ratings
        ${userId ? ', ur.rating AS user_rating' : ', NULL AS user_rating'}
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      ${userJoin}
    `;

    const whereClauses = [];

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      const pIdx = params.length;
      whereClauses.push(`(LOWER(s.name) LIKE $${pIdx} OR LOWER(s.address) LIKE $${pIdx})`);
    }

    if (name && name.trim()) {
      params.push(`%${name.trim().toLowerCase()}%`);
      whereClauses.push(`LOWER(s.name) LIKE $${params.length}`);
    }

    if (address && address.trim()) {
      params.push(`%${address.trim().toLowerCase()}%`);
      whereClauses.push(`LOWER(s.address) LIKE $${params.length}`);
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    sql += ` GROUP BY s.id, s.name, s.email, s.address ${userId ? ', ur.rating' : ''} `;

    const validSortFields = {
      name: 's.name',
      address: 's.address',
      overall_rating: 'overall_rating',
      user_rating: 'user_rating'
    };

    const sortCol = validSortFields[sortBy.toLowerCase()] || 's.name';
    const direction = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    sql += ` ORDER BY ${sortCol} ${direction}`;

    const result = await db.query(sql, params);

    return res.json({
      success: true,
      stores: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        address: row.address,
        overallRating: row.overall_rating !== null ? Number(row.overall_rating) : 0,
        totalRatings: Number(row.total_ratings || 0),
        userSubmittedRating: row.user_rating !== null ? Number(row.user_rating) : null
      }))
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStoreCatalog
};
