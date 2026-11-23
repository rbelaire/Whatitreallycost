import { getSql, logError } from "./db";
import { isSlug, slugify } from "./http";
import type { Submission } from "./types";

export type ReviewEdits = {
  tool?: string;
  appType?: string;
  title?: string;
  description?: string | null;
  credits?: number | null;
  tokens?: number | null;
  dollars?: number | null;
  prompts?: number | null;
  days?: number | null;
  shipped?: boolean | null;
  sourceUrl?: string;
  authorName?: string | null;
};

type Row = {
  id: string;
  tool: string;
  appType: string;
  title: string;
  description: string | null;
  credits: number | null;
  tokens: number | null;
  dollars: number | null;
  prompts: number | null;
  days: number | null;
  shipped: boolean | null;
  sourceUrl: string;
  authorName: string | null;
  status: Submission["status"];
};

export async function reviewSubmission(
  id: string,
  decision: "approve" | "reject",
  edits: ReviewEdits = {},
): Promise<{ ok: true; buildSlug?: string } | { ok: false; status: number; error: string }> {
  const sql = await getSql();
  if (!sql) return { ok: false, status: 503, error: "DATABASE_URL is not set" };

  try {
    const rows = await sql<Row[]>`
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
        status
      from submissions
      where id = ${id}::uuid
      limit 1
    `;
    const current = rows[0];
    if (!current) return { ok: false, status: 404, error: "Submission not found" };
    if (current.status !== "pending") {
      return { ok: false, status: 409, error: `Submission is already ${current.status}` };
    }

    if (decision === "reject") {
      await sql`
        update submissions
        set status = 'rejected', reviewed_at = now()
        where id = ${id}::uuid
      `;
      return { ok: true };
    }

    const next = {
      tool: edits.tool ?? current.tool,
      appType: edits.appType ?? current.appType,
      title: edits.title ?? current.title,
      description: edits.description === undefined ? current.description : edits.description,
      credits: edits.credits === undefined ? current.credits : edits.credits,
      tokens: edits.tokens === undefined ? current.tokens : edits.tokens,
      dollars: edits.dollars === undefined ? current.dollars : edits.dollars,
      prompts: edits.prompts === undefined ? current.prompts : edits.prompts,
      days: edits.days === undefined ? current.days : edits.days,
      shipped: edits.shipped === undefined ? current.shipped : edits.shipped,
      sourceUrl: edits.sourceUrl ?? current.sourceUrl,
      authorName: edits.authorName === undefined ? current.authorName : edits.authorName,
    };

    if (!isSlug(next.tool) || !isSlug(next.appType)) {
      return { ok: false, status: 400, error: "Tool and app type must be slugs." };
    }
    if (![next.credits, next.tokens, next.dollars].some((value) => typeof value === "number")) {
      return { ok: false, status: 400, error: "An approved build needs credits, tokens, or dollars." };
    }

    let slug = slugify(next.title);
    for (let n = 2; n < 50; n += 1) {
      const taken = await sql<{ slug: string }[]>`select slug from builds where slug = ${slug} limit 1`;
      if (taken.length === 0) break;
      slug = `${slugify(next.title).slice(0, 60)}-${n}`;
    }

    const inserted = await sql<{ id: string; slug: string }[]>`
      insert into builds (
        slug, tool, app_type, title, description,
        credits, tokens, dollars, prompts, days, shipped,
        source_url, author_name, submission_id
      ) values (
        ${slug},
        ${next.tool},
        ${next.appType},
        ${next.title},
        ${next.description},
        ${next.credits},
        ${next.tokens},
        ${next.dollars},
        ${next.prompts},
        ${next.days},
        ${next.shipped},
        ${next.sourceUrl},
        ${next.authorName},
        ${id}::uuid
      )
      returning id::text, slug
    `;

    await sql`
      update submissions
      set
        status = 'approved',
        build_id = ${inserted[0]!.id}::uuid,
        tool = ${next.tool},
        app_type = ${next.appType},
        title = ${next.title},
        description = ${next.description},
        credits = ${next.credits},
        tokens = ${next.tokens},
        dollars = ${next.dollars},
        prompts = ${next.prompts},
        days = ${next.days},
        shipped = ${next.shipped},
        source_url = ${next.sourceUrl},
        author_name = ${next.authorName},
        reviewed_at = now()
      where id = ${id}::uuid
    `;

    return { ok: true, buildSlug: inserted[0]!.slug };
  } catch (error) {
    await logError(error, "/api/admin/approve", { id });
    return { ok: false, status: 500, error: "Could not review that submission." };
  }
}
