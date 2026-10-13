import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSessionToken, type Role } from '@/app/lib/admin/session-token';

const state = vi.hoisted(() => ({
  cookie: undefined as string | undefined,
  user: null as any,
  uploaded: [] as { key: string; mime: string; bytes: number }[],
  unlinked: [] as string[],
  r2Deleted: [] as string[],
}));

vi.mock('next/headers', () => ({
  cookies: async () => ({ get: (name: string) => (state.cookie ? { name, value: state.cookie } : undefined) }),
}));

vi.mock('@/app/lib/db', () => ({
  query: vi.fn(async (sql: string) => (/FROM users WHERE id/.test(sql) && state.user ? [state.user] : [])),
  withTransaction: vi.fn(),
  getDbPool: vi.fn(),
}));

vi.mock('@/app/lib/r2', () => ({
  uploadToR2: vi.fn(async (key: string, buffer: Buffer, mime: string) => {
    state.uploaded.push({ key, mime, bytes: buffer.length });
    return `https://cdn.example/${key}`;
  }),
  deleteFromR2ByUrl: vi.fn(async (url: string) => { state.r2Deleted.push(url); }),
}));

// Guard the filesystem: a traversal bug must be observable here, never on disk.
vi.mock('fs', () => ({
  existsSync: vi.fn(() => true),
  unlinkSync: vi.fn((p: string) => { state.unlinked.push(p); }),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

const upload = await import('@/app/api/admin/upload/route');

function signInAs(role: Role) {
  state.user = { id: 'u1', name: 'T', email: 'a@d.com', role, status: 'active', token_version: 0 };
  state.cookie = createSessionToken({ userId: 'u1', role, name: 'T', email: 'a@d.com', ver: 0 });
}

const pad = (b: Buffer) => Buffer.concat([b, Buffer.alloc(32)]);
const PNG = pad(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
const JPEG = pad(Buffer.from([0xff, 0xd8, 0xff, 0xe0]));
const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP'), Buffer.alloc(16)]);
const GIF = pad(Buffer.from('GIF89a'));
const SVG = pad(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>'));

const postJson = (dataUrl: string) =>
  upload.POST(new Request('http://localhost/api/admin/upload', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl }),
  }));

const asDataUrl = (mime: string, buf: Buffer) => `data:${mime};base64,${buf.toString('base64')}`;

const postForm = (buf: Buffer, type: string, name = 'x') => {
  const fd = new FormData();
  fd.append('file', new File([new Uint8Array(buf)], name, { type }));
  return upload.POST(new Request('http://localhost/api/admin/upload', { method: 'POST', body: fd }));
};

const del = (url: string) =>
  upload.DELETE(new Request(`http://localhost/api/admin/upload?url=${encodeURIComponent(url)}`, { method: 'DELETE' }));

beforeEach(() => {
  process.env.R2_ACCOUNT_ID = 'acct';
  process.env.R2_ACCESS_KEY_ID = 'key';
  process.env.R2_SECRET_ACCESS_KEY = 'secret';
  state.uploaded = [];
  state.unlinked = [];
  state.r2Deleted = [];
  signInAs('admin');
});

describe('accepted image formats', () => {
  it.each([
    ['png', PNG, 'image/png'],
    ['jpg', JPEG, 'image/jpeg'],
    ['webp', WEBP, 'image/webp'],
    ['gif', GIF, 'image/gif'],
  ])('accepts a real %s and names it by its true type', async (ext, buf, mime) => {
    const res = await postJson(asDataUrl(mime, buf));
    expect(res.status).toBe(201);
    expect(state.uploaded.at(-1)!.key).toMatch(new RegExp(`\\.${ext}$`));
  });

  it('accepts a multipart upload', async () => {
    expect((await postForm(PNG, 'image/png', 'photo.png')).status).toBe(201);
  });
});

describe('SVG is rejected (stored XSS)', () => {
  it('rejects an SVG data URL', async () => {
    const res = await postJson(asDataUrl('image/svg+xml', SVG));
    expect(res.status).toBe(400);
    expect(state.uploaded).toHaveLength(0);
  });

  it('rejects an SVG uploaded as multipart', async () => {
    expect((await postForm(SVG, 'image/svg+xml', 'logo.svg')).status).toBe(400);
  });
});

describe('content is trusted over the declared type', () => {
  it('rejects script bytes even when the MIME claims image/png', async () => {
    const res = await postJson(asDataUrl('image/png', SVG));
    expect(res.status).toBe(400);
    expect(state.uploaded).toHaveLength(0);
  });

  it('rejects an HTML payload named as a .png file', async () => {
    const html = pad(Buffer.from('<html><script>alert(1)</script></html>'));
    expect((await postForm(html, 'image/png', 'innocent.png')).status).toBe(400);
  });

  it('stores a real PNG as .png even when the client claims webp', async () => {
    await postJson(asDataUrl('image/webp', PNG));
    expect(state.uploaded.at(-1)!.key).toMatch(/\.png$/);
  });
});

describe('malformed input', () => {
  it.each([
    ['not a data url', 'https://example.com/x.png'],
    ['empty', ''],
    ['no base64 payload', 'data:image/png;base64,'],
    ['truncated bytes', 'data:image/png;base64,iVBO'],
  ])('rejects %s', async (_label, dataUrl) => {
    expect((await postJson(dataUrl)).status).toBe(400);
  });

  it('rejects an unsupported content type', async () => {
    const res = await upload.POST(new Request('http://localhost/api/admin/upload', {
      method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: 'hello',
    }));
    expect(res.status).toBe(400);
  });

  it('rejects a file over the 5MB limit', async () => {
    const big = Buffer.concat([PNG, Buffer.alloc(6 * 1024 * 1024)]);
    expect((await postJson(asDataUrl('image/png', big))).status).toBe(400);
  });
});

describe('delete path handling', () => {
  it('removes a legitimate local upload', async () => {
    expect((await del('/uploads/products/prod_1.png')).status).toBe(200);
    expect(state.unlinked.at(-1)).toMatch(/prod_1\.png$/);
  });

  it.each([
    '/uploads/products/../../../.env',
    '/uploads/products/../../../../../../Windows/System32/config/SAM',
    '/uploads/products/..%2f..%2f.env',
    '/uploads/products/D:/secret.txt',
  ])('never escapes the uploads directory for %s', async (url) => {
    await del(url);
    // The property that matters is containment: whatever filename survives, the
    // resolved target must still sit directly inside public/uploads/products,
    // so no file elsewhere on the server can be reached.
    const uploadsDir = `${process.cwd().replace(/\\/g, '/')}/public/uploads/products`;
    for (const p of state.unlinked) {
      const normalised = p.replace(/\\/g, '/');
      expect(normalised.startsWith(`${uploadsDir}/`)).toBe(true);
      // Exactly one path segment below the directory — no nesting, no escape.
      expect(normalised.slice(uploadsDir.length + 1)).not.toContain('/');
    }
  });

  it('cannot reach the real .env at the project root', async () => {
    await del('/uploads/products/../../../.env');
    const rootEnv = `${process.cwd().replace(/\\/g, '/')}/.env`;
    expect(state.unlinked.map((p) => p.replace(/\\/g, '/'))).not.toContain(rootEnv);
  });

  it('requires a url parameter', async () => {
    const res = await upload.DELETE(new Request('http://localhost/api/admin/upload', { method: 'DELETE' }));
    expect(res.status).toBe(400);
  });

  it('routes a remote url to R2 rather than the filesystem', async () => {
    await del('https://cdn.example/products/prod_1.png');
    expect(state.r2Deleted).toHaveLength(1);
    expect(state.unlinked).toHaveLength(0);
  });
});

describe('upload permissions', () => {
  it('denies staff', async () => {
    signInAs('staff');
    expect((await postJson(asDataUrl('image/png', PNG))).status).toBe(403);
    expect((await del('/uploads/products/x.png')).status).toBe(403);
  });

  it('allows a manager', async () => {
    signInAs('manager');
    expect((await postJson(asDataUrl('image/png', PNG))).status).toBe(201);
  });
});
