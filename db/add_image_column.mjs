import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');
const raw = readFileSync(envPath, 'utf8');

let dbUrl = '';
for (const line of raw.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('DATABASE_URL=')) {
    dbUrl = trimmed.slice('DATABASE_URL='.length).replace(/^["']|["']$/g, '');
  }
}

const connection = await mysql.createConnection({
  uri: dbUrl,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
});

try {
  await connection.query('ALTER TABLE products ADD COLUMN image_url TEXT NULL');
  console.log('✅ Successfully added image_url column to products table');
} catch (e) {
  if (e.message && e.message.includes('Duplicate column')) {
    console.log('ℹ️ Column image_url already exists');
  } else {
    console.error('Error altering table:', e.message);
  }
}

await connection.end();
