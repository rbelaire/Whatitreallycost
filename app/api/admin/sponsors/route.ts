import { adminDenied, databaseRequired } from "@/lib/admin";
import { getSql, logError } from "@/lib/db";
import { httpUrl, isSlug, optionalText, readJson, textField } from "@/lib/http";
import { listSponsors } from "@/lib/queries";

export async function GET(request: Request) {
  const denied = await adminDenied(request);
  if (denied) return denied;
  const missing = await databaseRequired();
  if (missing) return missing;
  return Response.json({ sponsors: await listSponsors() });
}

export async function POST(request: Request) {
  const denied = await adminDenied(request);
  if (denied) return denied;
  const missing = await databaseRequired();
  if (missing) return missing;

  const body = await readJson(request);
  if (!body) return Response.json({ error: "Send JSON." }, { status: 400 });
  const id = optionalText(body.id, 80);
  const slug = textField(body.slug, 80);
  const name = textField(body.name, 120);
  const tagline = optionalText(body.tagline, 180);
  const url = httpUrl(body.url);
  const startsOn = textField(body.startsOn, 10);
  const endsOn = textField(body.endsOn, 10);
  const active = body.active === false || body.active === "false" ? false : true;

  if (!slug || !isSlug(slug) || !name || !url || !isDay(startsOn) || !isDay(endsOn)) {
    return Response.json(
      { error: "slug, name, url, startsOn, and endsOn are required. Dates are YYYY-MM-DD." },
      { status: 400 },
    );
  }
  if (startsOn! > endsOn!) {
    return Response.json({ error: "startsOn has to be on or before endsOn." }, { status: 400 });
  }

  const sql = await getSql();
  if (!sql) return Response.json({ error: "DATABASE_URL is not set" }, { status: 503 });

  try {
    if (id) {
      const rows = await sql<{ id: string }[]>`
        update sponsor_weeks
        set slug = ${slug}, name = ${name}, tagline = ${tagline}, url = ${url},
            starts_on = ${startsOn}, ends_on = ${endsOn}, active = ${active}
        where id = ${id}::uuid
        returning id::text
      `;
      if (!rows[0]) return Response.json({ error: "Sponsor week not found" }, { status: 404 });
      return Response.json({ id: rows[0].id, slug });
    }
    const rows = await sql<{ id: string }[]>`
      insert into sponsor_weeks (slug, name, tagline, url, starts_on, ends_on, active)
      values (${slug}, ${name}, ${tagline}, ${url}, ${startsOn}, ${endsOn}, ${active})
      returning id::text
    `;
    return Response.json({ id: rows[0]!.id, slug }, { status: 201 });
  } catch (error) {
    await logError(error, "/api/admin/sponsors");
    const message = error instanceof Error ? error.message : "";
    if (message.includes("duplicate") || message.includes("unique")) {
      return Response.json({ error: "That slug is already used." }, { status: 409 });
    }
    return Response.json({ error: "Could not save the sponsor week." }, { status: 500 });
  }
}

function isDay(value: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}
