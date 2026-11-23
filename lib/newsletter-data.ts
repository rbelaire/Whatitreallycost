import { typePhrase, toolName, typeName } from "./catalog";
import { getSql } from "./db";
import { creditLabel, dayLabel, money, promptLabel, tokenLabel } from "./format";
import { activeSponsor, dollarAverages } from "./queries";
import { absoluteUrl } from "./site";
import type { Build } from "./types";

const ISSUE_TIME_ZONE = "America/Chicago";

export type NewsletterPick = {
  title: string;
  href: string;
  blurb: string;
  tool: string;
  appType: string;
  cost: string;
  detail: string;
};

export type WeeklyProps = {
  siteUrl: string;
  /** Weekday and date in America/Chicago, e.g. "Monday, November 23, 2026". */
  issueDate: string;
  picks: NewsletterPick[];
  cheapest: NewsletterPick | null;
  priciest: NewsletterPick | null;
  average: { label: string; value: string; samples: number } | null;
  sponsor: { name: string; href: string; tagline: string | null } | null;
  weekNote: string;
};

/** The weekday of `now` in America/Chicago, so the header never claims a day it isn't. */
export function formatIssueDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ISSUE_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(now);
}

function oneLine(description: string | null | undefined): string {
  if (!description) return "";
  const flat = description.replace(/\s+/g, " ").trim();
  const sentence = flat.split(/(?<=\.)\s/)[0] ?? flat;
  if (sentence.length <= 140) return sentence;
  const cut = sentence.slice(0, 137);
  const space = cut.lastIndexOf(" ");
  return `${(space > 80 ? cut.slice(0, space) : cut).trim()}...`;
}

function compactTokens(value: number): string {
  if (value >= 1_000_000) return tokenLabel(value);
  if (value >= 10_000) {
    const thousands = value / 1_000;
    const digits = Number.isInteger(thousands) ? 0 : 1;
    return `${thousands.toLocaleString("en-US", { maximumFractionDigits: digits })}k tokens`;
  }
  return tokenLabel(value);
}

function summarize(build: Build): NewsletterPick {
  const primary =
    build.dollars != null
      ? money(build.dollars)
      : build.credits != null
        ? creditLabel(build.credits)
        : build.tokens != null
          ? compactTokens(build.tokens)
          : "Not stated";
  const detail: string[] = [];
  if (build.dollars != null && build.credits != null) detail.push(creditLabel(build.credits));
  if ((build.dollars != null || build.credits != null) && build.tokens != null) {
    detail.push(compactTokens(build.tokens));
  }
  if (build.prompts != null) detail.push(promptLabel(build.prompts));
  if (build.days != null) detail.push(dayLabel(build.days));
  return {
    title: build.title,
    href: absoluteUrl(`/builds/${build.slug}`),
    blurb: oneLine(build.description),
    tool: toolName(build.tool),
    appType: typeName(build.appType),
    cost: primary,
    detail: detail.join(" · "),
  };
}

const PICK_COLUMNS = `
  slug,
  tool,
  app_type as "appType",
  title,
  description,
  dollars::float8 as dollars,
  credits::float8 as credits,
  tokens::float8 as tokens,
  prompts::int as prompts,
  days::float8 as days
`;

export async function loadWeeklyProps(now = new Date()): Promise<WeeklyProps> {
  const site = absoluteUrl("/");
  const issueDate = formatIssueDate(now);
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
    select ${sql.unsafe(PICK_COLUMNS)}
    from builds
    order by created_at desc
    limit 5
  `;
  const picks = rows.map((row) => summarize(row as unknown as Build));

  const weekRows = await sql<Record<string, unknown>[]>`
    select ${sql.unsafe(PICK_COLUMNS)}
    from builds
    where dollars is not null
      and created_at >= now() - interval '7 days'
    order by dollars asc
  `;
  const priced = weekRows.map((row) => summarize(row as unknown as Build));
  const cheapest = priced[0] ?? null;
  const last = priced.length > 0 ? priced[priced.length - 1]! : null;
  const priciest = last && last.href !== cheapest?.href ? last : null;

  const averages = await dollarAverages();
  const top = averages[0];
  const sponsor = await activeSponsor();

  return {
    siteUrl: site,
    issueDate,
    picks,
    cheapest,
    priciest,
    average: top
      ? {
          label: `Average reported cost to build ${typePhrase(top.appType)}`,
          value: money(top.average),
          samples: top.samples,
        }
      : null,
    sponsor: sponsor
      ? {
          name: sponsor.name,
          href: absoluteUrl(`/go/${sponsor.slug}`),
          tagline: sponsor.tagline,
        }
      : null,
    weekNote:
      priced.length === 0
        ? "No build with a dollar total was added in the last 7 days."
        : "Cheapest and priciest use builds added in the last 7 days that stated a dollar total.",
  };
}
