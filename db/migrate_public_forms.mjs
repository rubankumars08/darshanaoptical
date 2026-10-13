// db/migrate_public_forms.mjs
//
// Creates the two tables the public website writes to. They were referenced by
// /api/appointments and /api/inquiries but no migration ever created them, so
// every booking and contact submission failed with ER_NO_SUCH_TABLE.
//
// Safe to run more than once.
//
//   node db/migrate_public_forms.mjs

import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadDbUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const raw = readFileSync(join(__dirname, '..', '.env.local'), 'utf8');
  for (const line of raw.split('\n')) {
    const t = line.trim();
    if (t.startsWith('DATABASE_URL=')) return t.slice('DATABASE_URL='.length).replace(/^["']|["']$/g, '');
  }
  throw new Error('DATABASE_URL not found in environment or .env.local');
}

const c = await mysql.createConnection({
  uri: loadDbUrl(),
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
});

try {
  await c.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id             INT AUTO_INCREMENT PRIMARY KEY,
      name           VARCHAR(255) NOT NULL,
      phone          VARCHAR(20)  NOT NULL,
      email          VARCHAR(255),
      preferred_date DATE,
      preferred_time VARCHAR(50),
      test_type      VARCHAR(100) NOT NULL DEFAULT 'Eye Testing',
      wears_glasses  VARCHAR(10)  NOT NULL DEFAULT 'No',
      notes          TEXT,
      status         ENUM('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
      created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status  (status),
      INDEX idx_created (created_at)
    )
  `);
  console.log('   ✓ appointments ready');

  await c.query(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(255) NOT NULL,
      phone      VARCHAR(20)  NOT NULL,
      email      VARCHAR(255),
      interest   VARCHAR(100) NOT NULL DEFAULT 'General Inquiry',
      message    TEXT,
      status     ENUM('new','contacted','closed') NOT NULL DEFAULT 'new',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_status  (status),
      INDEX idx_created (created_at)
    )
  `);
  console.log('   ✓ inquiries ready');

  const [[a]] = await c.query('SELECT COUNT(*) AS n FROM appointments');
  const [[i]] = await c.query('SELECT COUNT(*) AS n FROM inquiries');
  console.log(`\n✅ Done. appointments=${a.n} rows, inquiries=${i.n} rows.`);
} catch (e) {
  console.error('\n❌ Migration failed:', e.message);
  process.exitCode = 1;
} finally {
  await c.end();
}
