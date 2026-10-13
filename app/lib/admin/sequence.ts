// app/lib/admin/sequence.ts
// Gap-free document numbering.
//
// Invoice and purchase numbers used to be derived from `SELECT COUNT(*)` taken
// outside the transaction. Two tills ringing up a sale at the same moment read
// the same count and produced the same invoice number, and cancelling or
// deleting a row shifted every subsequent number. This keeps a dedicated
// counter row and takes a row lock inside the caller's transaction, so numbers
// are unique and monotonic.

import type { TxQuery } from '@/app/lib/db';

export type SequenceName = 'invoice' | 'purchase' | 'customer';

/**
 * Reserves and returns the next value for `name`.
 *
 * MUST be called inside `withTransaction` — the `FOR UPDATE` lock is only held
 * until the surrounding transaction commits, which is what serialises callers.
 */
export async function nextSequence(tx: TxQuery, name: SequenceName): Promise<number> {
  // Ensure the row exists before locking it; FOR UPDATE cannot lock a missing row.
  await tx.query('INSERT INTO counters (name, value) VALUES (?, 0) ON DUPLICATE KEY UPDATE name = name', [name]);
  const [row] = (await tx.query('SELECT value FROM counters WHERE name = ? FOR UPDATE', [name])) as any[];
  const next = Number(row?.value ?? 0) + 1;
  await tx.query('UPDATE counters SET value = ? WHERE name = ?', [next, name]);
  return next;
}
