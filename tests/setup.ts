// tests/setup.ts — runs before every test file.

// A deterministic 64-char secret. The session module refuses anything shorter
// than 32 characters, and the legacy password path is keyed on this value, so
// it must be stable across the whole suite.
process.env.SESSION_SECRET = 'test-secret-0123456789abcdef0123456789abcdef0123456789abcdef01';

// NODE_ENV is already 'test' under vitest, which keeps session cookies
// non-secure so assertions don't depend on the environment.

// Fail loudly if application code ever reaches for a real database during a
// unit test: every suite that needs one mocks '@/app/lib/db' explicitly.
process.env.DATABASE_URL ??= 'mysql://unused:unused@127.0.0.1:3306/unused';
