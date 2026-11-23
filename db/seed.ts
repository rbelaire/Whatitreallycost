import { readFileSync } from "node:fs";
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });
config({ path: ".env" });

type SeedBuild = {
  slug: string;
  tool: string;
  appType: string;
  title: string;
  description: string;
  credits: number | null;
  tokens: number | null;
  dollars: number | null;
  prompts: number | null;
  days: number | null;
  shipped: boolean | null;
  sourceUrl: string;
  authorName: string | null;
};

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("DATABASE_URL is not set. Nothing was seeded.");
  process.exit(1);
}

const builds = JSON.parse(readFileSync(new URL("./seed.json", import.meta.url), "utf8")) as SeedBuild[];

for (const build of builds) {
  if (!build.slug || !build.sourceUrl.startsWith("http")) {
    throw new Error(`Seed entry ${build.slug || "(missing slug)"} needs an http(s) source URL.`);
  }
  const hasNumber = [build.credits, build.tokens, build.dollars].some((value) => typeof value === "number");
  if (!hasNumber) {
    throw new Error(`${build.slug} has no stated credits, tokens, or dollars.`);
  }
}

const sql = postgres(url, {
  max: 1,
  prepare: false,
  ssl: /localhost|127\.0\.0\.1|sslmode=disable/i.test(url) ? false : "require",
});

async function main() {
  try {
    for (const build of builds) {
      await sql`
        insert into builds (
          slug, tool, app_type, title, description,
          credits, tokens, dollars, prompts, days, shipped,
          source_url, author_name
        ) values (
          ${build.slug},
          ${build.tool},
          ${build.appType},
          ${build.title},
          ${build.description},
          ${build.credits},
          ${build.tokens},
          ${build.dollars},
          ${build.prompts},
          ${build.days},
          ${build.shipped},
          ${build.sourceUrl},
          ${build.authorName}
        )
        on conflict (slug) do update set
          tool = excluded.tool,
          app_type = excluded.app_type,
          title = excluded.title,
          description = excluded.description,
          credits = excluded.credits,
          tokens = excluded.tokens,
          dollars = excluded.dollars,
          prompts = excluded.prompts,
          days = excluded.days,
          shipped = excluded.shipped,
          source_url = excluded.source_url,
          author_name = excluded.author_name
      `;
    }
    console.log(`Seeded ${builds.length} builds.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

void main();
