import { describe, it, expect, beforeEach } from 'vitest';
import { nextSequence } from '@/app/lib/admin/sequence';
import type { TxQuery } from '@/app/lib/db';

/**
 * Fake transaction backed by a counters map, with an explicit row lock so the
 * test can prove that two concurrent callers are serialised rather than both
 * reading the same value — the exact failure that produced duplicate invoice
 * numbers when this was `SELECT COUNT(*)`.
 */
function makeTx(counters = new Map<string, number>()) {
  const locks = new Map<string, Promise<void>>();
  let releaseCurrent: (() => void) | null = null;

  const tx: TxQuery = {
    async query(sql: string, params: any[] = []) {
      if (sql.startsWith('INSERT INTO counters')) {
        if (!counters.has(params[0])) counters.set(params[0], 0);
        return { affectedRows: 1 } as any;
      }
      if (sql.includes('FOR UPDATE')) {
        const name = params[0];
        // Wait for any in-flight holder, then take the lock ourselves.
        while (locks.has(name)) await locks.get(name);
        let release!: () => void;
        locks.set(name, new Promise<void>((r) => { release = () => { locks.delete(name); r(); }; }));
        releaseCurrent = release;
        return [{ value: counters.get(name) ?? 0 }] as any;
      }
      if (sql.startsWith('UPDATE counters')) {
        counters.set(params[1], params[0]);
        releaseCurrent?.();
        releaseCurrent = null;
        return { affectedRows: 1 } as any;
      }
      throw new Error(`unexpected SQL: ${sql}`);
    },
  };
  return { tx, counters };
}

describe('nextSequence', () => {
  let ctx: ReturnType<typeof makeTx>;
  beforeEach(() => { ctx = makeTx(); });

  it('starts at 1 for a brand new counter', async () => {
    expect(await nextSequence(ctx.tx, 'invoice')).toBe(1);
  });

  it('increments monotonically', async () => {
    const seen = [];
    for (let i = 0; i < 5; i++) seen.push(await nextSequence(ctx.tx, 'invoice'));
    expect(seen).toEqual([1, 2, 3, 4, 5]);
  });

  it('continues from a value seeded by the migration', async () => {
    const seeded = makeTx(new Map([['invoice', 125]]));
    expect(await nextSequence(seeded.tx, 'invoice')).toBe(126);
  });

  it('keeps separate series per document type', async () => {
    await nextSequence(ctx.tx, 'invoice');
    await nextSequence(ctx.tx, 'invoice');
    expect(await nextSequence(ctx.tx, 'purchase')).toBe(1);
    expect(await nextSequence(ctx.tx, 'customer')).toBe(1);
    expect(await nextSequence(ctx.tx, 'invoice')).toBe(3);
  });

  it('never hands the same number to two concurrent callers', async () => {
    // The regression this replaced: COUNT(*) read outside the transaction gave
    // both tills the same invoice number.
    const results = await Promise.all(
      Array.from({ length: 20 }, () => nextSequence(ctx.tx, 'invoice'))
    );
    expect(new Set(results).size).toBe(20);
    expect([...results].sort((a, b) => a - b)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it('formats into the invoice number the route builds', async () => {
    const seeded = makeTx(new Map([['invoice', 125]]));
    const n = await nextSequence(seeded.tx, 'invoice');
    expect(`DO-2026-${String(n).padStart(5, '0')}`).toBe('DO-2026-00126');
  });
});
