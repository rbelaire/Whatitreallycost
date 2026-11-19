import { readFileSync } from "node:fs";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("DATABASE_URL is not set. Nothing was migrated.");
  process.exit(1);
}

const sql = postgres(url, {
  max: 1,
  prepare: false,
  ssl: /localhost|127\.0\.0\.1|sslmode=disable/i.test(url) ? false : "require",
});

const file = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");

async function main() {
  try {
    await sql.unsafe(file);
    console.log("Migration applied.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

void main();
