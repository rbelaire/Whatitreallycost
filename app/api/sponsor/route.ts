import { getSql, logError } from "@/lib/db";
import { emailProblem } from "@/lib/email-guard";
import { clientIpHash, honeypotTripped, optionalText, readJson, textField } from "@/lib/http";
import { recentCount } from "@/lib/queries";
import { notifySponsorLead } from "@/lib/resend-sync";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return Response.json({ error: "Send JSON." }, { status: 400 });
  if (honeypotTripped(body)) {
    return Response.json({ message: "Got it. We’ll reply by email." });
  }

  const name = textField(body.name, 120);
  const email = textField(body.email, 200)?.toLowerCase();
  const company = optionalText(body.company, 160);
  const message = optionalText(body.message, 4000);
  if (!name || !email) return Response.json({ error: "Name and email are required." }, { status: 400 });
  const problem = emailProblem(email);
  if (problem) return Response.json({ error: problem }, { status: 400 });

  const sql = await getSql();
  if (!sql) {
    return Response.json({ error: "The database isn’t connected, so this note wasn’t saved." }, { status: 503 });
  }

  const ipHash = clientIpHash(request);
  try {
    const recent = await recentCount("sponsor_leads", ipHash);
    if (recent >= 3) {
      return Response.json({ error: "Too many notes from this network. Try again in an hour." }, { status: 429 });
    }
    const rows = await sql<{ id: string }[]>`
      insert into sponsor_leads (name, email, company, message, ip_hash)
      values (${name}, ${email}, ${company}, ${message}, ${ipHash})
      returning id::text
    `;
    const id = rows[0]!.id;
    const notified = await notifySponsorLead({ id, name, email, company, message });
    if (notified) {
      await sql`update sponsor_leads set notified = true where id = ${id}::uuid`;
    }
    return Response.json({
      message: notified
        ? "Got it. We’ll reply by email."
        : "Saved. Email notification isn’t configured, but the note is in the database.",
    });
  } catch (error) {
    await logError(error, "/api/sponsor");
    return Response.json({ error: "Could not save that note." }, { status: 500 });
  }
}
