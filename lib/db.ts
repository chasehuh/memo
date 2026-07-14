import { Pool, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __agentnotePool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __agentnoteSchemaReady: Promise<void> | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  return new Pool({
    connectionString,
    ssl: connectionString.includes("localhost")
      ? undefined
      : { rejectUnauthorized: false },
    max: 5,
  });
}

export function getPool() {
  if (!global.__agentnotePool) {
    global.__agentnotePool = createPool();
  }
  return global.__agentnotePool;
}

export async function ensureSchema() {
  if (!global.__agentnoteSchemaReady) {
    global.__agentnoteSchemaReady = (async () => {
      const pool = getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS notes (
          id UUID PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL DEFAULT '',
          body TEXT NOT NULL DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      // Existing deployments created notes without user_id — add nullable first.
      await pool.query(`
        ALTER TABLE notes ADD COLUMN IF NOT EXISTS user_id TEXT;
      `);
      await pool.query(`
        CREATE INDEX IF NOT EXISTS notes_user_updated_at_idx
        ON notes (user_id, updated_at DESC);
      `);
      // Only enforce NOT NULL once legacy rows are backfilled (see README).
      await pool.query(`
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'notes'
              AND column_name = 'user_id'
              AND is_nullable = 'YES'
          ) AND NOT EXISTS (
            SELECT 1 FROM notes WHERE user_id IS NULL
          ) THEN
            ALTER TABLE notes ALTER COLUMN user_id SET NOT NULL;
          END IF;
        END $$;
      `);
    })();
  }
  await global.__agentnoteSchemaReady;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  await ensureSchema();
  return getPool().query<T>(text, params);
}
