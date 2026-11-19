import { typePhrase, toolName, typeName } from "./catalog";
import { getSql } from "./db";
import { costParts, money } from "./format";
import { activeSponsor, dollarAverages } from "./queries";
import { absoluteUrl } from "./site";
import type { Build } from "./types";

export type NewsletterPick = {
  title: string;
  href: string;
  line: string;
};

export type WeeklyProps = {
  siteUrl: string;
  issueDate: string;
  picks: NewsletterPick[];
  cheapest: NewsletterPick | null;
  priciest: NewsletterPick | null;
  average: { label: string; value: string; samples: number } | null;
  sponsor: { name: string; href: string } | null;
  weekNote: string;
};

function pick(build: Build): NewsletterPick {
  const parts = costParts(build);
  const kind = `${toolName(build.tool)} · ${typeName(build.appType)}`;
  return {
    title: build.title,
    href: absoluteUrl(`/builds/${build.slug}`),
    line: parts.length ? `${kind} · ${parts.join(" · ")}` : kind,
  };
}

export async function loadWeeklyProps(now = new Date()): Promise<WeeklyProps> {
  const site = absoluteUrl("/");
  const issueDate = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const empty: WeeklyProps = {
    siteUrl: site,
    issueDate,
    picks: [],
    cheapest: null,
    priciest: null,
    average: null,
    sponsor: null,
    weekNote: "No database is connected, so this issue has no builds yet.",
  };
  const sql = await getSql();
  if (!sql) return empty;

  const rows = await sql<Record<string, unknown>[]>`
    select
      slug,
      tool,
      app_type as "appType",
      title,
      dollars::float8 as dollars,
      credits::float8 as credits,
      tokens::float8 as tokens,
      prompts::int as prompts,
      days::float8 as days,
      created_at as "createdAt"
    from builds
    order by created_at desc
    limit 5
  `;
  const picks = rows.map((row) => pick(row as unknown as Build));

  const weekRows = await sql<Record<string, unknown>[]>`
    select
      slug,
      tool,
      app_type as "appType",
      title,
      dollars::float8 as dollars,
      credits::float8 as credits,
      tokens::float8 as tokens,
      prompts::int as prompts,
      days::float8 as days
    from builds
    where dollars is not null
      and created_at >= now() - interval '7 days'
    order by dollars asc
  `;
  const priced = weekRows.map((row) => pick(row as unknown as Build));
  const cheapest = priced[0] ?? null;
  const priciest = priced.length > 1 ? priced[priced.length - 1]! : priced.length === 1 ? priced[0]! : null;

  const averages = await dollarAverages();
  const top = averages[0];
  const sponsor = await activeSponsor();

  return {
    siteUrl: site,
    issueDate,
    picks,
    cheapest,
    priciest: priciest && priciest.href !== cheapest?.href ? priciest : priced.length === 1 ? null : priciest,
    average: top
      ? {
          label: `Average reported cost to build ${typePhrase(top.appType)}`,
          value: money(top.average),
          samples: top.samples,
        }
      : null,
    sponsor: sponsor
      ? { name: sponsor.name, href: absoluteUrl(`/go/${sponsor.slug}`) }
      : null,
    weekNote:
      priced.length === 0
        ? "No build with a dollar total was added in the last 7 days."
        : "Cheapest and priciest use builds added in the last 7 days that stated a dollar total.",
  };
}
