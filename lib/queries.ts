import { logError, getSql, type Sql } from "./db";
import type {
  Build,
  BuildFilters,
  CreditAverage,
  DollarAverage,
  SponsorWeek,
  Submission,
} from "./types";

const BUILD_COLUMNS = `
  id::text,
  slug,
  tool,
  app_type as "appType",
  title,
  description,
  credits::float8 as credits,
  tokens::float8 as tokens,
  dollars::float8 as dollars,
  prompts::int as prompts,
  days::float8 as days,
  shipped,
  source_url as "sourceUrl",
  author_name as "authorName",
  created_at as "createdAt"
`;

function asBuild(row: Record<string, unknown>): Build {
  return {
    ...(row as unknown as Build),
    createdAt: toIso(row.createdAt),
  };
}

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "");
}

function dateOnly(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

async function withSql<T>(fallback: T, run: (sql: Sql) => Promise<T>, path?: string): Promise<T> {
  try {
    const sql = await getSql();
    if (!sql) return fallback;
    return await run(sql);
  } catch (error) {
    await logError(error, path);
    return fallback;
  }
}

export async function listBuilds(filters: BuildFilters = {}): Promise<Build[]> {
  const q = filters.q?.trim() || null;
  const tool = filters.tool || null;
  const type = filters.type || null;
  const shipped = filters.shipped || null;
  const like = q ? `%${q.replace(/[%_\\]/g, "\\$&")}%` : null;

  return withSql([], async (sql) => {
    const rows = await sql<Record<string, unknown>[]>`
      select ${sql.unsafe(BUILD_COLUMNS)}
      from builds
      where (${tool}::text is null or tool = ${tool})
        and (${type}::text is null or app_type = ${type})
        and (
          ${shipped}::text is null
          or (${shipped} = 'yes' and shipped is true)
          or (${shipped} = 'no' and shipped is false)
        )
        and (
          ${like}::text is null
          or title ilike ${like} escape '\\'
          or coalesce(description, '') ilike ${like} escape '\\'
          or tool ilike ${like} escape '\\'
          or app_type ilike ${like} escape '\\'
          or coalesce(author_name, '') ilike ${like} escape '\\'
        )
      order by dollars asc nulls last, credits asc nulls last, tokens asc nulls last, created_at desc
    `;
    return rows.map(asBuild);
  }, "/");
}

export async function getBuild(slug: string): Promise<Build | null> {
  return withSql(null, async (sql) => {
    const rows = await sql<Record<string, unknown>[]>`
      select ${sql.unsafe(BUILD_COLUMNS)}
      from builds
      where slug = ${slug}
      limit 1
    `;
    return rows[0] ? asBuild(rows[0]) : null;
  }, `/builds/${slug}`);
}

export async function relatedBuilds(build: Build): Promise<Build[]> {
  return withSql([], async (sql) => {
    const rows = await sql<Record<string, unknown>[]>`
      select ${sql.unsafe(BUILD_COLUMNS)}
      from builds
      where slug <> ${build.slug}
        and (tool = ${build.tool} or app_type = ${build.appType})
      order by (tool = ${build.tool}) desc, dollars asc nulls last
      limit 4
    `;
    return rows.map(asBuild);
  });
}

export async function listSlugs(): Promise<string[]> {
  return withSql([], async (sql) => {
    const rows = await sql<{ slug: string }[]>`select slug from builds order by slug`;
    return rows.map((row) => row.slug);
  });
}

export async function countBuildsFor(column: "tool" | "app_type", value: string): Promise<number> {
  return withSql(0, async (sql) => {
    const rows = await sql<{ n: number }[]>`
      select count(*)::int as n
      from builds
      where ${sql(column)} = ${value}
    `;
    return rows[0]?.n ?? 0;
  });
}

export async function dollarAverages(tool?: string): Promise<DollarAverage[]> {
  return withSql<DollarAverage[]>([], async (sql) => {
    const rows = await sql<DollarAverage[]>`
      select
        app_type as "appType",
        avg(dollars)::float8 as average,
        min(dollars)::float8 as lowest,
        count(dollars)::int as samples
      from builds
      where dollars is not null
        and (${tool ?? null}::text is null or tool = ${tool ?? null})
      group by app_type
      order by samples desc, average asc
    `;
    return rows;
  });
}

export async function creditAverages(limit = 4): Promise<CreditAverage[]> {
  return withSql<CreditAverage[]>([], async (sql) => {
    const rows = await sql<CreditAverage[]>`
      select
        tool,
        app_type as "appType",
        avg(credits)::float8 as average,
        count(credits)::int as samples
      from builds
      where credits is not null
      group by tool, app_type
      order by samples desc, average asc
      limit ${limit}
    `;
    return rows;
  });
}

export async function toolSummary(tool: string): Promise<{
  builds: number;
  shipped: number;
  avgDollars: number | null;
  dollarSamples: number;
  avgCredits: number | null;
  creditSamples: number;
  avgTokens: number | null;
  tokenSamples: number;
}> {
  const empty = {
    builds: 0,
    shipped: 0,
    avgDollars: null,
    dollarSamples: 0,
    avgCredits: null,
    creditSamples: 0,
    avgTokens: null,
    tokenSamples: 0,
  };
  return withSql(empty, async (sql) => {
    const rows = await sql<
      {
        builds: number;
        shipped: number;
        avgDollars: number | null;
        dollarSamples: number;
        avgCredits: number | null;
        creditSamples: number;
        avgTokens: number | null;
        tokenSamples: number;
      }[]
    >`
      select
        count(*)::int as builds,
        count(*) filter (where shipped is true)::int as shipped,
        avg(dollars)::float8 as "avgDollars",
        count(dollars)::int as "dollarSamples",
        avg(credits)::float8 as "avgCredits",
        count(credits)::int as "creditSamples",
        avg(tokens)::float8 as "avgTokens",
        count(tokens)::int as "tokenSamples"
      from builds
      where tool = ${tool}
    `;
    return rows[0] ?? empty;
  });
}

export async function rememberZeroResult(query: string, filters: BuildFilters): Promise<void> {
  const q = query.trim().slice(0, 160);
  if (q.length < 2) return;
  await withSql(undefined, async (sql) => {
    await sql`
      insert into zero_result_searches (query, filters)
      select ${q}, ${sql.json({
        tool: filters.tool ?? null,
        type: filters.type ?? null,
        shipped: filters.shipped ?? null,
      })}
      where not exists (
        select 1 from zero_result_searches
        where query = ${q}
          and created_at > now() - interval '1 hour'
      )
    `;
  });
}

export async function recordPageview(path: string): Promise<void> {
  const clean = (path.split("?")[0] || "/").slice(0, 300);
  if (
    clean.startsWith("/api") ||
    clean.startsWith("/go") ||
    clean === "/robots.txt" ||
    clean === "/sitemap.xml" ||
    clean.includes("opengraph-image") ||
    clean.includes("icon")
  ) {
    return;
  }
  await withSql(undefined, async (sql) => {
    await sql`
      insert into pageviews (path, day, count)
      values (${clean}, current_date, 1)
      on conflict (path, day)
      do update set count = pageviews.count + 1
    `;
  }, clean);
}

export async function recentCount(table: "submissions" | "signups" | "sponsor_leads", ipHash: string): Promise<number> {
  return withSql(0, async (sql) => {
    const rows = await sql<{ n: number }[]>`
      select count(*)::int as n
      from ${sql(table)}
      where ip_hash = ${ipHash}
        and created_at > now() - interval '1 hour'
    `;
    return rows[0]?.n ?? 0;
  });
}

export async function activeSponsor(): Promise<SponsorWeek | null> {
  return withSql(null, async (sql) => {
    const rows = await sql<Record<string, unknown>[]>`
      select
        id::text,
        slug,
        name,
        tagline,
        url,
        starts_on as "startsOn",
        ends_on as "endsOn",
        active
      from sponsor_weeks
      where active
        and starts_on <= current_date
        and ends_on >= current_date
      order by starts_on desc
      limit 1
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      ...(row as unknown as SponsorWeek),
      startsOn: dateOnly(row.startsOn),
      endsOn: dateOnly(row.endsOn),
    };
  });
}

export async function sponsorBySlug(slug: string): Promise<SponsorWeek | null> {
  return withSql(null, async (sql) => {
    const rows = await sql<Record<string, unknown>[]>`
      select
        id::text,
        slug,
        name,
        tagline,
        url,
        starts_on as "startsOn",
        ends_on as "endsOn",
        active
      from sponsor_weeks
      where slug = ${slug}
      limit 1
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      ...(row as unknown as SponsorWeek),
      startsOn: dateOnly(row.startsOn),
      endsOn: dateOnly(row.endsOn),
    };
  });
}

export async function listSponsors(): Promise<SponsorWeek[]> {
  return withSql([], async (sql) => {
    const rows = await sql<Record<string, unknown>[]>`
      select
        id::text,
        slug,
        name,
        tagline,
        url,
        starts_on as "startsOn",
        ends_on as "endsOn",
        active
      from sponsor_weeks
      order by starts_on desc
    `;
    return rows.map((row) => ({
      ...(row as unknown as SponsorWeek),
      startsOn: dateOnly(row.startsOn),
      endsOn: dateOnly(row.endsOn),
    }));
  });
}

export async function logSponsorClick(slug: string, path: string | null, referrer: string | null): Promise<void> {
  await withSql(undefined, async (sql) => {
    await sql`
      insert into sponsor_clicks (sponsor_slug, path, referrer)
      values (${slug}, ${path}, ${referrer})
    `;
  }, `/go/${slug}`);
}

export async function publicStats(): Promise<{
  builds: number;
  subscribers: number;
  monthlyPageviews: number;
}> {
  const empty = { builds: 0, subscribers: 0, monthlyPageviews: 0 };
  return withSql(empty, async (sql) => {
    const rows = await sql<
      { builds: number; subscribers: number; monthlyPageviews: number }[]
    >`
      select
        (select count(*)::int from builds) as builds,
        (select count(*)::int from signups) as subscribers,
        (
          select coalesce(sum(count), 0)::int
          from pageviews
          where day >= date_trunc('month', current_date)::date
        ) as "monthlyPageviews"
    `;
    return rows[0] ?? empty;
  });
}

export async function pendingSubmissions(): Promise<Submission[]> {
  return withSql([], async (sql) => {
    const rows = await sql<Record<string, unknown>[]>`
      select
        id::text,
        tool,
        app_type as "appType",
        title,
        description,
        credits::float8 as credits,
        tokens::float8 as tokens,
        dollars::float8 as dollars,
        prompts::int as prompts,
        days::float8 as days,
        shipped,
        source_url as "sourceUrl",
        author_name as "authorName",
        email,
        status,
        build_id::text as "buildId",
        created_at as "createdAt",
        reviewed_at as "reviewedAt"
      from submissions
      where status = 'pending'
      order by created_at asc
    `;
    return rows.map((row) => ({
      ...(row as unknown as Submission),
      id: String(row.id),
      slug: "",
      createdAt: toIso(row.createdAt),
      reviewedAt: row.reviewedAt ? toIso(row.reviewedAt) : null,
    }));
  });
}

export async function adminStats() {
  return withSql(null, async (sql) => {
    const [pageviews, counts, clicks] = await Promise.all([
      sql<{ day: string; views: number }[]>`
        select day::text as day, sum(count)::int as views
        from pageviews
        where day >= current_date - 30
        group by day
        order by day asc
      `,
      sql<
        {
          signups: number;
          builds: number;
          pending: number;
          approved: number;
          rejected: number;
        }[]
      >`
        select
          (select count(*)::int from signups) as signups,
          (select count(*)::int from builds) as builds,
          (select count(*)::int from submissions where status = 'pending') as pending,
          (select count(*)::int from submissions where status = 'approved') as approved,
          (select count(*)::int from submissions where status = 'rejected') as rejected
      `,
      sql<{ sponsor: string; clicks: number }[]>`
        select sponsor_slug as sponsor, count(*)::int as clicks
        from sponsor_clicks
        group by sponsor_slug
        order by clicks desc
      `,
    ]);
    return {
      pageviewsByDay: pageviews,
      signups: counts[0]?.signups ?? 0,
      builds: counts[0]?.builds ?? 0,
      submissions: {
        pending: counts[0]?.pending ?? 0,
        approved: counts[0]?.approved ?? 0,
        rejected: counts[0]?.rejected ?? 0,
      },
      sponsorClicks: clicks,
    };
  });
}

export async function zeroResultSearches(limit = 100) {
  return withSql<{ id: string; query: string; filters: unknown; createdAt: string }[]>([], async (sql) => {
    return sql<{ id: string; query: string; filters: unknown; createdAt: string }[]>`
      select id::text, query, filters, created_at as "createdAt"
      from zero_result_searches
      order by created_at desc
      limit ${limit}
    `;
  });
}
