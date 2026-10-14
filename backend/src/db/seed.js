const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seedDatabase() {
  console.log('--- Starting Database Seeding ---');
  await db.getDb();

  // Clear existing records to ensure idempotent fresh seed
  console.log('Clearing existing data...');
  await db.query('DELETE FROM ratings');
  await db.query('DELETE FROM stores');
  await db.query('DELETE FROM users');
  try {
    await db.query("DELETE FROM sqlite_sequence WHERE name IN ('stores', 'users', 'ratings')");
  } catch {
    // sqlite_sequence may not exist in postgres
  }

  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin@1234', salt);
  const userPass = await bcrypt.hash('User@1234', salt);
  const ownerPass = await bcrypt.hash('Owner@1234', salt);

  console.log('Seeding demo users (all names satisfy the min 20 character requirement)...');

  // 1. System Administrator
  const adminRes = await db.query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, 'ADMIN')
     RETURNING id`,
    [
      'System Administrator Master',
      'admin@storerating.com',
      adminPass,
      '742 Evergreen Terrace, Administrative Block 4, Springfield'
    ]
  );
  const adminId = adminRes.rows[0]?.id || adminRes.insertId;

  // 2. Normal Users
  const u1Res = await db.query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, 'USER')
     RETURNING id`,
    [
      'Alexander Bartholomew Smith',
      'alexander@storerating.com',
      userPass,
      '123 Baker Street, Apartment 4B, Marylebone, London'
    ]
  );
  const user1Id = u1Res.rows[0]?.id || u1Res.insertId;

  const u2Res = await db.query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, 'USER')
     RETURNING id`,
    [
      'Christopher Montgomery Vance',
      'christopher@storerating.com',
      userPass,
      '456 Elmwood Avenue, Suite 100, Seattle, WA'
    ]
  );
  const user2Id = u2Res.rows[0]?.id || u2Res.insertId;

  const u3Res = await db.query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, 'USER')
     RETURNING id`,
    [
      'Elizabeth Katherine Holmes',
      'elizabeth@storerating.com',
      userPass,
      '789 Tech Boulevard, Building C, Palo Alto, CA'
    ]
  );
  const user3Id = u3Res.rows[0]?.id || u3Res.insertId;

  // 3. Store Owners
  const o1Res = await db.query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, 'STORE_OWNER')
     RETURNING id`,
    [
      'Jonathan Edward Martinez Jr',
      'jonathan@artisancoffee.com',
      ownerPass,
      '100 Market Street, Financial District, San Francisco, CA'
    ]
  );
  const owner1Id = o1Res.rows[0]?.id || o1Res.insertId;

  const o2Res = await db.query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES ($1, $2, $3, $4, 'STORE_OWNER')
     RETURNING id`,
    [
      'Margaret Penelope Henderson',
      'margaret@greenleafbooks.com',
      ownerPass,
      '220 Harvard Square, Main Atrium, Cambridge, MA'
    ]
  );
  const owner2Id = o2Res.rows[0]?.id || o2Res.insertId;

  console.log('Seeding stores...');

  const s1Res = await db.query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [
      'Artisan Roast & Brew Coffeehouse',
      'contact@artisancoffee.com',
      '100 Market Street, Ground Floor, San Francisco, CA',
      owner1Id
    ]
  );
  const store1Id = s1Res.rows[0]?.id || s1Res.insertId;

  const s2Res = await db.query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [
      'Greenleaf Heritage Books & Vinyl',
      'hello@greenleafbooks.com',
      '220 Harvard Square, Main Atrium, Cambridge, MA',
      owner2Id
    ]
  );
  const store2Id = s2Res.rows[0]?.id || s2Res.insertId;

  const s3Res = await db.query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES ($1, $2, $3, NULL)
     RETURNING id`,
    [
      'Apex Mechanical & Bicycle Works',
      'support@apexbikes.com',
      '505 Industrial Park Road, Bay 12, Austin, TX'
    ]
  );
  const store3Id = s3Res.rows[0]?.id || s3Res.insertId;

  const s4Res = await db.query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES ($1, $2, $3, NULL)
     RETURNING id`,
    [
      'Solstice Organic Farmer Grocery',
      'orders@solsticeorganic.com',
      '88 Sunshine Valley Highway, Portland, OR'
    ]
  );
  const store4Id = s4Res.rows[0]?.id || s4Res.insertId;

  console.log('Seeding initial ratings (1 to 5 scale)...');

  // Artisan Roast ratings
  await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [user1Id, store1Id, 5]);
  await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [user2Id, store1Id, 4]);
  await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [user3Id, store1Id, 5]);

  // Greenleaf Books ratings
  await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [user1Id, store2Id, 4]);
  await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [user2Id, store2Id, 3]);

  // Apex Mechanical rating
  await db.query('INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)', [user3Id, store3Id, 4]);

  console.log('--- Database Seeding Complete ---');
  console.log('Credentials Summary:');
  console.log('  Admin:       admin@storerating.com         / Admin@1234');
  console.log('  Store Owner: jonathan@artisancoffee.com    / Owner@1234');
  console.log('  Store Owner: margaret@greenleafbooks.com   / Owner@1234');
  console.log('  Normal User: alexander@storerating.com     / User@1234');
  console.log('  Normal User: christopher@storerating.com   / User@1234');
  console.log('  Normal User: elizabeth@storerating.com     / User@1234');

  await db.close();
}

if (require.main === module) {
  seedDatabase().catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}

module.exports = seedDatabase;
