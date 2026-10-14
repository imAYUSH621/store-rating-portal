const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const env = require('./env');

let pgPool = null;
let sqliteDb = null;
let sqlJsInstance = null;
let dbFilePath = null;
let isPostgres = false;

// Convert PostgreSQL parameterized query ($1, $2, ...) to SQLite standard (?)
function convertPgToSqliteParams(sql) {
  return sql.replace(/\$(\d+)/g, '?');
}

async function initSqlite() {
  if (sqliteDb) return sqliteDb;

  const initSqlJs = require('sql.js');
  sqlJsInstance = await initSqlJs();

  const isVercel = !!process.env.VERCEL;
  const dataDir = isVercel ? '/tmp' : path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    try {
      fs.mkdirSync(dataDir, { recursive: true });
    } catch {
      // ignore read-only fs warnings if already exists
    }
  }

  dbFilePath = path.join(dataDir, 'store_portal.sqlite');
  const templatePath = path.resolve(__dirname, '../../data/store_portal.sqlite');

  if (fs.existsSync(dbFilePath)) {
    const fileBuffer = fs.readFileSync(dbFilePath);
    sqliteDb = new sqlJsInstance.Database(fileBuffer);
  } else if (fs.existsSync(templatePath)) {
    const fileBuffer = fs.readFileSync(templatePath);
    sqliteDb = new sqlJsInstance.Database(fileBuffer);
    persistSqlite();
  } else {
    sqliteDb = new sqlJsInstance.Database();
  }

  // Create SQLite tables if they do not exist
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      address TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, store_id)
    );
  `);

  persistSqlite();
  return sqliteDb;
}

function persistSqlite() {
  if (!sqliteDb || !dbFilePath) return;
  try {
    const data = sqliteDb.export();
    fs.writeFileSync(dbFilePath, Buffer.from(data));
  } catch (err) {
    console.error('[DB] Failed to persist SQLite database to disk:', err.message);
  }
}

async function getDb() {
  if (env.DATABASE_URL) {
    if (!pgPool) {
      try {
        pgPool = new Pool({
          connectionString: env.DATABASE_URL,
          ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        // Test connectivity
        await pgPool.query('SELECT 1');
        isPostgres = true;
        console.log('[DB] Connected to PostgreSQL via DATABASE_URL');
        return { type: 'postgres' };
      } catch (err) {
        console.warn('[DB] PostgreSQL connection failed. Falling back to persistent SQLite:', err.message);
        pgPool = null;
      }
    } else {
      return { type: 'postgres' };
    }
  }

  await initSqlite();
  isPostgres = false;
  return { type: 'sqlite' };
}

/**
 * Universal Query Method
 * Supports both PostgreSQL and SQLite seamlessly
 * @param {string} sql - SQL query using $1, $2 parameterized syntax
 * @param {Array} params - Query arguments
 * @returns {Promise<{ rows: Array, rowCount: number, insertId?: number }>}
 */
async function query(sql, params = []) {
  await getDb();

  if (isPostgres && pgPool) {
    const res = await pgPool.query(sql, params);
    return {
      rows: res.rows,
      rowCount: res.rowCount,
      insertId: res.rows[0]?.id
    };
  }

  // SQLite execution
  const sqliteSql = convertPgToSqliteParams(sql.trim());
  const upper = sqliteSql.toUpperCase();

  if (upper.startsWith('SELECT') || upper.startsWith('WITH') || upper.includes('RETURNING')) {
    const stmt = sqliteDb.prepare(sqliteSql);
    try {
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      persistSqlite();

      let lastId = rows[0]?.id || null;
      if (!lastId && !upper.startsWith('SELECT')) {
        const idCheck = sqliteDb.exec("SELECT last_insert_rowid() AS id");
        if (idCheck?.[0]?.values?.[0]?.[0]) {
          lastId = idCheck[0].values[0][0];
        }
      }

      return {
        rows,
        rowCount: rows.length,
        insertId: lastId
      };
    } finally {
      stmt.free();
    }
  } else {
    // Direct INSERT / UPDATE / DELETE / DDL without RETURNING
    sqliteDb.run(sqliteSql, params);
    persistSqlite();

    let lastId = null;
    let changes = 0;
    try {
      const res = sqliteDb.exec("SELECT last_insert_rowid() AS id, changes() AS ch");
      if (res && res[0] && res[0].values && res[0].values[0]) {
        lastId = res[0].values[0][0];
        changes = res[0].values[0][1];
      }
    } catch {
      // ignore
    }

    return {
      rows: [],
      rowCount: changes,
      insertId: lastId
    };
  }
}

module.exports = {
  query,
  getDb,
  isPostgres: () => isPostgres,
  close: async () => {
    if (pgPool) await pgPool.end();
    if (sqliteDb) persistSqlite();
  }
};
