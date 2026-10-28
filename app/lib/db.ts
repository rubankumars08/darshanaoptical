import mysql, { Pool, PoolConnection } from "mysql2/promise";

let pool: Pool;

export function getDbPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(
        "[db] DATABASE_URL environment variable is not set. " +
        "Add it to .env.local (see .env.example)."
      );
    }

    pool = mysql.createPool({
      uri: databaseUrl,
      waitForConnections: true,
      connectionLimit: 10,
      // Keep maxIdle below connectionLimit so mysql2 actually starts its idle
      // connection reaper. With both values set to 10 the cleanup timer is not
      // created, leaving TiDB sockets in the pool after the gateway closes them;
      // the next API request then fails once with ECONNRESET.
      maxIdle: 2,
      idleTimeout: 30000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      ssl: {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      },
    });
  }

  return pool;
}

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const db = getDbPool();
  const [results] = await db.execute(sql, params);
  return results as T;
}

export interface TxQuery {
  query<T = any>(sql: string, params?: any[]): Promise<T>;
}

/**
 * Runs `fn` inside a single DB transaction on a dedicated connection,
 * committing on success and rolling back if `fn` throws.
 */
export async function withTransaction<T>(fn: (tx: TxQuery) => Promise<T>): Promise<T> {
  const db = getDbPool();
  const conn: PoolConnection = await db.getConnection();
  try {
    await conn.beginTransaction();
    const tx: TxQuery = {
      query: async (sql, params) => {
        const [results] = await conn.execute(sql, params);
        return results as any;
      },
    };
    const result = await fn(tx);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
