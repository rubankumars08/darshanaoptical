// db/migrate_security.mjs
//
// Applies the schema changes required by the admin security hardening:
//   1. users.token_version   — lets a role/password/status change revoke that
//                              user's existing session cookies immediately.
//   2. login_attempts        — database-backed brute-force throttle.
//   3. counters              — collision-free invoice and purchase numbering,
//                              seeded from the highest number already issued.
//
// Safe to run more than once.
//
//   node db/migrate_security.mjs

import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadDbUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const raw = readFileSync(join(__dirname, '..', '.env.local'), 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL=')) {
      return trimmed.slice('DATABASE_URL='.length).replace(/^["']|["']$/g, '');
    }
  }
  throw new Error('DATABASE_URL not found in environment or .env.local');
}

const connection = await mysql.createConnection({
  uri: loadDbUrl(),
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
});

async function addColumn(table, column, definition) {
  try {
    await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`   ✓ ${table}.${column} added`);
  } catch (e) {
    if (e.message?.includes('Duplicate column')) console.log(`   • ${table}.${column} already exists`);
    else throw e;
  }
}

/** Highest trailing number already used in `column`, e.g. DO-2026-00137 -> 137. */
async function highestIssued(table, column) {
  const [rows] = await connection.query(`SELECT ${column} AS n FROM ${table}`);
  let max = 0;
  for (const row of rows) {
    const m = String(row.n ?? '').match(/(\d+)\s*$/);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max;
}

try {
  console.log('1. users.token_version');
  await addColumn('users', 'token_version', 'INT NOT NULL DEFAULT 0');

  console.log('2. login_attempts');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      identifier     VARCHAR(190) PRIMARY KEY,
      attempts       INT NOT NULL DEFAULT 0,
      last_failed_at DATETIME NULL,
      locked_until   DATETIME NULL,
      updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('   ✓ login_attempts ready');

  console.log('3. counters');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS counters (
      name  VARCHAR(64) PRIMARY KEY,
      value BIGINT NOT NULL DEFAULT 0
    )
  `);

  // Seed from existing documents so the first new number continues the series
  // rather than colliding with one already printed.
  const seeds = {
    invoice: await highestIssued('invoices', 'invoice_number'),
    purchase: await highestIssued('purchases', 'purchase_number'),
    customer: await highestIssued('customers', 'customer_id'),
  };

  for (const [name, value] of Object.entries(seeds)) {
    await connection.query(
      'INSERT INTO counters (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = GREATEST(value, VALUES(value))',
      [name, value]
    );
  }
  console.log(`   ✓ counters seeded (${Object.entries(seeds).map(([k, v]) => `${k}=${v}`).join(', ')})`);

  console.log('\n✅ Security migration complete.');
  console.log('   Existing session cookies are now invalid — everyone must sign in again.');
  console.log('   Legacy password hashes still work and upgrade to scrypt on next login.');
} catch (e) {
  console.error('\n❌ Migration failed:', e.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
