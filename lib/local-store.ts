import { appendFile, mkdir } from "node:fs/promises";

const DIRS = ["data", "/tmp/what-it-really-cost"];

/** Prefer ./data. Fall back to /tmp when the project directory is read-only (Vercel without a database). */
export async function appendLocalJsonl(file: string, record: Record<string, unknown>): Promise<void> {
  const line = `${JSON.stringify({ ...record, at: new Date().toISOString() })}\n`;
  let last: unknown;
  for (const dir of DIRS) {
    try {
      await mkdir(dir, { recursive: true });
      await appendFile(`${dir}/${file}`, line, "utf8");
      return;
    } catch (error) {
      last = error;
    }
  }
  throw last;
}
