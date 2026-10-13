// One-off cleanup for the E2E test record created during live testing.
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';

const raw = readFileSync('.env.local', 'utf8');
let url = '';
for (const line of raw.split('\n')) {
  if (line.startsWith('DATABASE_URL=')) url = line.slice('DATABASE_URL='.length).replace(/^["']|["']$/g, '');
}
const conn = await mysql.createConnection({ uri: url, ssl: { minVersion: 'TLSv1.2' } });
const [res] = await conn.execute(
  "DELETE FROM appointments WHERE id = 120002 AND name = 'x' AND phone = '123'"
);
console.log('deleted rows:', res.affectedRows);
await conn.end();
