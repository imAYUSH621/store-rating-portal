const bcrypt = require('bcryptjs');
const db = require('../config/db');

/**
 * Dashboard stats: Total Users, Total Stores, Total Ratings
 */
async function getDashboardStats(req, res, next) {
  try {
    const usersCount = await db.query('SELECT COUNT(*) AS total FROM users');
    const storesCount = await db.query('SELECT COUNT(*) AS total FROM stores');
    const ratingsCount = await db.query('SELECT COUNT(*) AS total FROM ratings');

    return res.json({
      success: true,
      stats: {
        totalUsers: Number(usersCount.rows[0]?.total || 0),
        totalStores: Number(storesCount.rows[0]?.total || 0),
        totalRatings: Number(ratingsCount.rows[0]?.total || 0)
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Add a new user (System Admin can create Normal User, Admin, or Store Owner)
 */
async function addUser(req, res, next) {
  try {
    const { name, email, password, address, role } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const assignedRole = role || 'USER';

    const existing = await db.query('SELECT id FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const insertResult = await db.query(
      `INSERT INTO users (name, email, password_hash, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role, created_at`,
      [name.trim(), normalizedEmail, passwordHash, address.trim(), assignedRole]
    );

    const created = insertResult.rows[0];
    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: created
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Add a new store (System Admin)
 */
async function addStore(req, res, next) {
  try {
    const { name, email, address, ownerId } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // If ownerId provided, verify it exists and is a STORE_OWNER
    let verifiedOwnerId = null;
    if (ownerId) {
      const ownerCheck = await db.query('SELECT id, role FROM users WHERE id = $1', [ownerId]);
      if (ownerCheck.rows.length > 0) {
        verifiedOwnerId = ownerCheck.rows[0].id;
      }
    }

    const insertResult = await db.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id, created_at`,
      [name.trim(), normalizedEmail, address.trim(), verifiedOwnerId]
    );

    return res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      store: insertResult.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * List all users with filtering and sorting
 * If user is a STORE_OWNER, their store's average rating is also displayed.
 */
async function getUsers(req, res, next) {
  try {
    const { search, name, email, address, role, sortBy = 'name', sortOrder = 'asc' } = req.query;

    let baseQuery = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.address,
        u.role,
        u.created_at,
        s.id AS store_id,
        s.name AS store_name,
        ROUND(AVG(r.rating), 2) AS rating
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id
      LEFT JOIN ratings r ON s.id = r.store_id
    `;

    const whereClauses = [];
    const params = [];

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      const pIdx = params.length;
      whereClauses.push(
        `(LOWER(u.name) LIKE $${pIdx} OR LOWER(u.email) LIKE $${pIdx} OR LOWER(u.address) LIKE $${pIdx} OR LOWER(u.role) LIKE $${pIdx})`
      );
    }

    if (name && name.trim()) {
      params.push(`%${name.trim().toLowerCase()}%`);
      whereClauses.push(`LOWER(u.name) LIKE $${params.length}`);
    }

    if (email && email.trim()) {
      params.push(`%${email.trim().toLowerCase()}%`);
      whereClauses.push(`LOWER(u.email) LIKE $${params.length}`);
    }

    if (address && address.trim()) {
      params.push(`%${address.trim().toLowerCase()}%`);
      whereClauses.push(`LOWER(u.address) LIKE $${params.length}`);
    }

    if (role && role.trim()) {
      params.push(role.trim().toUpperCase());
      whereClauses.push(`u.role = $${params.length}`);
    }

    if (whereClauses.length > 0) {
      baseQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    baseQuery += ' GROUP BY u.id, u.name, u.email, u.address, u.role, u.created_at, s.id, s.name ';

    // Safe sorting fields
    const validSortFields = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'u.role',
      rating: 'rating',
      created_at: 'u.created_at'
    };

    const sortColumn = validSortFields[sortBy.toLowerCase()] || 'u.name';
    const direction = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    baseQuery += ` ORDER BY ${sortColumn} ${direction}`;

    const result = await db.query(baseQuery, params);

    return res.json({
      success: true,
      users: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        address: row.address,
        role: row.role,
        storeId: row.store_id,
        storeName: row.store_name,
        rating: row.rating !== null ? Number(row.rating) : null,
        createdAt: row.created_at
      }))
    });
  } catch (err) {
    next(err);
  }
}

/**
 * List all stores with overall average rating, filtering, and sorting
 */
async function getStores(req, res, next) {
  try {
    const { search, name, email, address, sortBy = 'name', sortOrder = 'asc' } = req.query;

    let baseQuery = `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        s.created_at,
        ROUND(AVG(r.rating), 2) AS rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
    `;

    const whereClauses = [];
    const params = [];

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      const pIdx = params.length;
      whereClauses.push(
        `(LOWER(s.name) LIKE $${pIdx} OR LOWER(s.email) LIKE $${pIdx} OR LOWER(s.address) LIKE $${pIdx})`
      );
    }

    if (name && name.trim()) {
      params.push(`%${name.trim().toLowerCase()}%`);
      whereClauses.push(`LOWER(s.name) LIKE $${params.length}`);
    }

    if (email && email.trim()) {
      params.push(`%${email.trim().toLowerCase()}%`);
      whereClauses.push(`LOWER(s.email) LIKE $${params.length}`);
    }

    if (address && address.trim()) {
      params.push(`%${address.trim().toLowerCase()}%`);
      whereClauses.push(`LOWER(s.address) LIKE $${params.length}`);
    }

    if (whereClauses.length > 0) {
      baseQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    baseQuery += ' GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at ';

    const validSortFields = {
      name: 's.name',
      email: 's.email',
      address: 's.address',
      rating: 'rating',
      total_ratings: 'total_ratings',
      created_at: 's.created_at'
    };

    const sortColumn = validSortFields[sortBy.toLowerCase()] || 's.name';
    const direction = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    baseQuery += ` ORDER BY ${sortColumn} ${direction}`;

    const result = await db.query(baseQuery, params);

    return res.json({
      success: true,
      stores: result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        address: row.address,
        ownerId: row.owner_id,
        rating: row.rating !== null ? Number(row.rating) : 0,
        totalRatings: Number(row.total_ratings || 0),
        createdAt: row.created_at
      }))
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardStats,
  addUser,
  addStore,
  getUsers,
  getStores
};
