import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const directory = dirname(fileURLToPath(import.meta.url));
const EXPECTED_DATABASE = 'darshana_optical';
const CONFIRMATION = `--confirm-reset=${EXPECTED_DATABASE}`;

const TABLES = [
  'invoice_items',
  'payments',
  'purchase_items',
  'stock_movements',
  'eye_tests',
  'invoices',
  'purchases',
  'expenses',
  'appointments',
  'inquiries',
  'audit_logs',
  'products',
  'suppliers',
  'customers',
  'login_attempts',
  'counters',
  'shop_settings',
  'users',
];

function loadEnv() {
  const raw = readFileSync(join(directory, '..', '.env.local'), 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = value;
  }
}

async function main() {
  if (!process.argv.includes(CONFIRMATION)) {
    throw new Error(`Reset refused. Pass ${CONFIRMATION} to confirm the target database.`);
  }

  loadEnv();
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');

  const url = new URL(process.env.DATABASE_URL);
  const database = url.pathname.replace(/^\//, '');
  if (database !== EXPECTED_DATABASE) {
    throw new Error(`Reset refused for database "${database || '(none)'}". Expected "${EXPECTED_DATABASE}".`);
  }

  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: { minVersion: 'TLSv1.2' },
  });

  try {
    for (const table of TABLES) {
      await connection.execute(`DROP TABLE IF EXISTS \`${table}\``);
      console.log(`Dropped ${table}`);
    }
  } finally {
    await connection.end();
  }

  console.log(`Reset complete for ${EXPECTED_DATABASE}. Run npm run db:migrate to recreate it.`);
}

main().catch((error) => {
  console.error(`Database reset failed: ${error.message}`);
  process.exit(1);
});
