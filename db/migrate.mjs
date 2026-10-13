// db/migrate.mjs — Run this ONCE to create all tables and seed admin user
// Usage: node db/migrate.mjs

import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { randomBytes, scrypt as scryptCb } from 'crypto';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createInterface } from 'readline';

const scrypt = promisify(scryptCb);

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load env manually (no dotenv needed) ─────────────────────
function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env.local');
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (key && !process.env[key]) process.env[key] = val;
    }
  } catch {
    console.warn('⚠  Could not read .env.local — using process environment');
  }
}

// ─── Password hashing (scrypt, salted) ────────────────────────
// Must stay in step with the format read by app/lib/admin/password.ts.
const SCRYPT_N = 16384, SCRYPT_R = 8, SCRYPT_P = 1, SCRYPT_KEYLEN = 64;

async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password.normalize('NFKC'), salt, SCRYPT_KEYLEN, {
    N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P, maxmem: 64 * 1024 * 1024,
  });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString('base64')}$${key.toString('base64')}`;
}

// Generates a readable but high-entropy password (~95 bits).
function generatePassword() {
  const alphabet = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(16);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('') + '7a';
}

// ─── Seed data ────────────────────────────────────────────────
const SEED_USERS = [
  {
    id: 'usr-001',
    name: 'Darshana Raj',
    email: 'admin@darshana.com',
    // Passwords are NOT hard-coded any more — the previous fixed values
    // (admin@2026 etc.) were committed to the repository, so anyone with the
    // source could sign in. Each run takes the password from
    // SEED_ADMIN_PASSWORD / SEED_MANAGER_PASSWORD / SEED_STAFF_PASSWORD, or
    // generates a random one and prints it once.
    envVar: 'SEED_ADMIN_PASSWORD',
    role: 'admin',
    phone: '8870571536',
  },
  {
    id: 'usr-002',
    name: 'Arun Kumar',
    email: 'manager@darshana.com',
    envVar: 'SEED_MANAGER_PASSWORD',
    role: 'manager',
    phone: '',
  },
  {
    id: 'usr-003',
    name: 'Kumar Muthu',
    email: 'staff@darshana.com',
    envVar: 'SEED_STAFF_PASSWORD',
    role: 'staff',
    phone: '',
  },
];

async function main() {
  loadEnv();

  const db = process.env.DATABASE_URL;
  if (!db) throw new Error('DATABASE_URL not set in .env.local');

  console.log('📡 Connecting to TiDB…');
  const conn = await mysql.createConnection({ uri: db, ssl: { minVersion: 'TLSv1.2' } });

  // ─── Run schema ───────────────────────────────────────────
  console.log('🗄  Running schema.sql…');
  const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

  // Split on semicolons (skip empty statements)
  const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    await conn.execute(stmt);
  }
  console.log(`✅ Schema applied (${statements.length} statements)`);

  // ─── Seed users ───────────────────────────────────────────
  console.log('👤 Seeding admin users…');
  const issued = [];
  for (const u of SEED_USERS) {
    const [existing] = await conn.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [u.email]);
    if (existing.length) {
      console.log(`   • ${u.role}: ${u.email} already exists — password left unchanged`);
      continue;
    }

    const password = process.env[u.envVar] || generatePassword();
    const hash = await hashPassword(password);
    await conn.execute(
      `INSERT INTO users (id, name, email, password_hash, role, phone, status, joined_at)
       VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [u.id, u.name, u.email, hash, u.role, u.phone]
    );
    issued.push({ ...u, password, generated: !process.env[u.envVar] });
    console.log(`   ✓ ${u.role}: ${u.email}`);
  }

  await conn.end();

  if (issued.length) {
    console.log('\n🔐 Sign-in credentials — shown ONCE, store them in a password manager:');
    for (const u of issued) {
      console.log(`   ${u.role.padEnd(8)} ${u.email}  ${u.password}${u.generated ? '  (generated)' : ''}`);
    }
    console.log('\n   Change these after first sign-in via Admin → Staff Team.');
  }
  console.log('\n🎉 Migration complete.\n');
}

main().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
