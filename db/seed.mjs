import mysql from 'mysql2/promise';
import { randomBytes, scrypt as scryptCallback } from 'crypto';
import { promisify } from 'util';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const directory = dirname(fileURLToPath(import.meta.url));
const scrypt = promisify(scryptCallback);
const EXPECTED_DATABASE = 'darshana_optical';
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_LENGTH = 64;

const ACCOUNTS = [
  { id: 'usr-001', name: 'Darshana Raj', email: 'admin@darshana.com', role: 'admin', phone: '8870571536', passwordVariable: 'SEED_ADMIN_PASSWORD' },
  { id: 'usr-002', name: 'Arun Kumar', email: 'manager@darshana.com', role: 'manager', phone: '', passwordVariable: 'SEED_MANAGER_PASSWORD' },
  { id: 'usr-003', name: 'Kumar Muthu', email: 'staff@darshana.com', role: 'staff', phone: '', passwordVariable: 'SEED_STAFF_PASSWORD' },
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

async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize('NFKC'), salt, SCRYPT_KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: 64 * 1024 * 1024,
  });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString('base64')}$${key.toString('base64')}`;
}

async function main() {
  loadEnv();
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  const database = new URL(process.env.DATABASE_URL).pathname.replace(/^\//, '');
  if (database !== EXPECTED_DATABASE) throw new Error(`Account seed refused for database "${database}".`);

  const connection = await mysql.createConnection({ uri: process.env.DATABASE_URL, ssl: { minVersion: 'TLSv1.2' } });
  await connection.beginTransaction();
  try {
    for (const account of ACCOUNTS) {
      const [rows] = await connection.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [account.email]);
      const password = process.env[account.passwordVariable];

      if (rows.length) {
        if (password) {
          const passwordHash = await hashPassword(password);
          await connection.execute(
            `UPDATE users
             SET name = ?, role = ?, phone = ?, status = 'active', password_hash = ?, token_version = token_version + 1
             WHERE email = ?`,
            [account.name, account.role, account.phone, passwordHash, account.email],
          );
        } else {
          await connection.execute(
            `UPDATE users SET name = ?, role = ?, phone = ?, status = 'active' WHERE email = ?`,
            [account.name, account.role, account.phone, account.email],
          );
        }
      } else {
        if (!password) {
          throw new Error(`${account.passwordVariable} is required to create missing account ${account.email}.`);
        }
        await connection.execute(
          `INSERT INTO users (id, name, email, password_hash, role, phone, status, joined_at)
           VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())`,
          [account.id, account.name, account.email, await hashPassword(password), account.role, account.phone],
        );
      }

      console.log(`Account ready: ${account.email} (${account.role})${password ? ' — password updated' : ' — password preserved'}`);
    }

    await connection.commit();
    console.log('Authentication seed complete. No operational data was created.');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(`Authentication seed failed: ${error.message}`);
  process.exit(1);
});
