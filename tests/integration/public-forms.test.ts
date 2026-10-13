import { describe, it, expect, beforeEach, vi } from 'vitest';

const state = vi.hoisted(() => ({
  inserts: [] as { sql: string; params: any[] }[],
  submissions: new Map<string, number>(),
  failDb: false,
}));

vi.mock('@/app/lib/db', () => ({
  query: vi.fn(async (sql: string, params: any[] = []) => {
    if (state.failDb) throw new Error('ER_NO_SUCH_TABLE: secret internal detail');
    if (/INSERT INTO login_attempts/.test(sql)) {
      const k = params[0];
      state.submissions.set(k, (state.submissions.get(k) ?? 0) + 1);
      return {};
    }
    if (/SELECT attempts FROM login_attempts/.test(sql)) {
      return [{ attempts: state.submissions.get(params[0]) ?? 0 }];
    }
    if (/INSERT INTO (appointments|inquiries)/.test(sql)) {
      state.inserts.push({ sql, params });
      return { insertId: 1 };
    }
    return [];
  }),
  withTransaction: vi.fn(),
  getDbPool: vi.fn(),
}));

vi.mock('@/app/lib/mailer', () => ({
  sendAppointmentConfirmation: vi.fn(async () => {}),
  sendInquiryNotification: vi.fn(async () => {}),
}));

const appointments = await import('@/app/api/appointments/route');
const inquiries = await import('@/app/api/inquiries/route');

const post = (mod: any, body: unknown, ip = '203.0.113.1') =>
  mod.POST(new Request('http://localhost/api/x', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  }));

const booking = (over = {}) => ({ name: 'Ravi Kumar', phone: '9000000000', email: 'ravi@example.com', ...over });
const enquiry = (over = {}) => ({ name: 'Ravi Kumar', phone: '9000000000', interest: 'Frames', ...over });

beforeEach(() => {
  state.inserts = [];
  state.submissions.clear();
  state.failDb = false;
});

describe('public booking form', () => {
  it('accepts a valid booking', async () => {
    const res = await post(appointments, booking());
    expect(res.status).toBe(201);
    expect(state.inserts).toHaveLength(1);
  });

  it('requires a name and phone', async () => {
    expect((await post(appointments, booking({ name: '' }))).status).toBe(400);
    expect((await post(appointments, booking({ phone: '' }), '198.51.100.2')).status).toBe(400);
  });

  it.each(['123', 'not-a-phone', '+91 (90000) 00000'])('rejects invalid phone number %s', async (phone) => {
    expect((await post(appointments, booking({ phone }))).status).toBe(400);
  });

  it.each(['9000000000', '+91 90000 00000', '020-7946-0958'])(
    'accepts valid phone number %s',
    async (phone) => {
      expect((await post(appointments, booking({ phone }))).status).toBe(201);
    }
  );

  it('rejects a malformed email', async () => {
    expect((await post(appointments, booking({ email: 'not-an-email' }))).status).toBe(400);
  });

  it('treats an empty email as absent rather than invalid', async () => {
    expect((await post(appointments, booking({ email: '' }))).status).toBe(201);
    expect(state.inserts[0].params[2]).toBeNull();
  });

  it('caps field lengths so the database cannot be stuffed', async () => {
    const res = await post(appointments, booking({ name: 'A'.repeat(5000) }));
    expect(res.status).toBe(400);
  });

  it('applies defaults for optional fields', async () => {
    await post(appointments, booking());
    expect(state.inserts[0].params).toContain('Eye Testing');
    expect(state.inserts[0].params).toContain('No');
  });
});

describe('public contact form', () => {
  it('accepts a valid enquiry', async () => {
    expect((await post(inquiries, enquiry())).status).toBe(201);
  });

  it('requires a name and phone', async () => {
    expect((await post(inquiries, enquiry({ name: '' }))).status).toBe(400);
  });

  it('rejects an invalid phone number', async () => {
    expect((await post(inquiries, enquiry({ phone: '123' }))).status).toBe(400);
  });

  it('caps the message length', async () => {
    expect((await post(inquiries, enquiry({ message: 'x'.repeat(9000) }))).status).toBe(400);
  });
});

describe('submission throttling', () => {
  it('blocks a flood from one address', async () => {
    const ip = '198.51.100.77';
    for (let i = 0; i < 5; i++) {
      expect((await post(appointments, booking(), ip)).status).toBe(201);
    }
    const blocked = await post(appointments, booking(), ip);
    expect(blocked.status).toBe(429);
  });

  it('does not penalise a different address', async () => {
    for (let i = 0; i < 6; i++) await post(appointments, booking(), '198.51.100.88');
    expect((await post(appointments, booking(), '203.0.113.200')).status).toBe(201);
  });

  it('counts the two forms separately', async () => {
    const ip = '198.51.100.99';
    for (let i = 0; i < 6; i++) await post(appointments, booking(), ip);
    // The contact form has its own allowance for the same visitor.
    expect((await post(inquiries, enquiry(), ip)).status).toBe(201);
  });
});

describe('error handling never leaks internals', () => {
  it.each([
    ['appointments', () => post(appointments, booking())],
    ['inquiries', () => post(inquiries, enquiry())],
  ])('%s returns a generic message on a database failure', async (_name, call) => {
    state.failDb = true;
    const res = await call();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).not.toMatch(/ER_NO_SUCH_TABLE|secret internal detail/);
  });
});

describe('admin count endpoints', () => {
  const getWith = (mod: any, secret?: string) =>
    mod.GET(new Request('http://localhost/api/x', { headers: secret ? { 'x-admin-secret': secret } : {} }));

  beforeEach(() => { process.env.ADMIN_API_SECRET = 'a-long-test-admin-secret-value'; });

  it('rejects a missing or wrong secret', async () => {
    expect((await getWith(appointments)).status).toBe(401);
    expect((await getWith(appointments, 'wrong')).status).toBe(401);
    expect((await getWith(inquiries, 'wrong')).status).toBe(401);
  });

  it('accepts the correct secret', async () => {
    expect((await getWith(appointments, 'a-long-test-admin-secret-value')).status).toBe(200);
  });

  it('rejects everything when the secret is not configured', async () => {
    delete process.env.ADMIN_API_SECRET;
    expect((await getWith(appointments, 'anything')).status).toBe(401);
  });
});
