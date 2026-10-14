const db = require('../config/db');
const { validateRating } = require('../middleware/validate');

/**
 * Submit or modify a rating for a specific store
 * Uses atomic UPSERT logic (or check + update/insert)
 */
async function submitOrUpdateRating(req, res, next) {
  try {
    const userId = req.user.id;
    const storeId = Number(req.params.storeId || req.body.storeId);
    const { rating } = req.body;

    if (!storeId || isNaN(storeId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid store ID is required.'
      });
    }

    const ratingError = validateRating(rating);
    if (ratingError) {
      return res.status(400).json({
        success: false,
        message: ratingError
      });
    }

    // Verify store exists
    const storeCheck = await db.query('SELECT id, name FROM stores WHERE id = $1', [storeId]);
    if (!storeCheck.rows || storeCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.'
      });
    }

    // Check if user already submitted a rating for this store
    const existing = await db.query(
      'SELECT id, rating FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    let action = 'submitted';
    if (existing.rows && existing.rows.length > 0) {
      // Modify existing rating
      await db.query(
        `UPDATE ratings
         SET rating = $1, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2 AND store_id = $3`,
        [rating, userId, storeId]
      );
      action = 'modified';
    } else {
      // Submit new rating
      await db.query(
        `INSERT INTO ratings (user_id, store_id, rating)
         VALUES ($1, $2, $3)`,
        [userId, storeId, rating]
      );
    }

    // Fetch refreshed store statistics
    const statsResult = await db.query(
      `SELECT
         ROUND(AVG(rating), 2) AS overall_rating,
         COUNT(id) AS total_ratings
       FROM ratings
       WHERE store_id = $1`,
      [storeId]
    );

    const stats = statsResult.rows[0];

    return res.json({
      success: true,
      message: `Rating ${action} successfully.`,
      storeId,
      userRating: rating,
      overallRating: stats.overall_rating !== null ? Number(stats.overall_rating) : 0,
      totalRatings: Number(stats.total_ratings || 0)
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitOrUpdateRating
};
