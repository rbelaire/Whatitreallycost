import postgres from "postgres";

export type Sql = ReturnType<typeof postgres>;

const globalForSql = globalThis as unknown as { sql?: Sql };

export function databaseUrl(): string {
  return process.env.DATABASE_URL?.trim() ?? "";
}

export function hasDatabase(): boolean {
  return databaseUrl().length > 0;
}

/** Call from a Server Component before reading DATABASE_URL for UI copy. */
export async function databaseReady(): Promise<boolean> {
  await prepareRequest();
  return hasDatabase();
}

/**
 * Opt the current request into dynamic rendering before env is read.
 * Scripts that import this file are not inside a request, so the call is ignored.
 */
export async function prepareRequest(): Promise<void> {
  try {
    const nextServer = await import("next/server");
    if (typeof nextServer.connection === "function") {
      await nextServer.connection();
    }
  } catch {
    // db:migrate and db:seed run outside a Next request.
  }
}

export async function getSql(): Promise<Sql | null> {
  await prepareRequest();
  const url = databaseUrl();
  if (!url) return null;
  if (!globalForSql.sql) {
    const local = /localhost|127\.0\.0\.1/.test(url) || /sslmode=disable/i.test(url);
    globalForSql.sql = postgres(url, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      // Required for Supabase's transaction pooler (pgbouncer).
      prepare: false,
      ssl: local ? false : "require",
    });
  }
  return globalForSql.sql;
}

export async function logError(
  error: unknown,
  path?: string | null,
  context?: Record<string, unknown> | null,
): Promise<void> {
  const sql = await getSql();
  if (!sql) return;
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? (error.stack ?? null) : null;
  try {
    await sql`
      insert into errors (message, stack, path, context)
      values (
        ${message.slice(0, 2000)},
        ${stack},
        ${path ?? null},
        ${context ? sql.json(context) : null}
      )
    `;
  } catch {
    // Avoid a loop if the errors table itself is unavailable.
  }
}
