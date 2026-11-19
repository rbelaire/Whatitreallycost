import { getSql, logError } from "@/lib/db";
import { emailProblem } from "@/lib/email-guard";
import { clientIpHash, honeypotTripped, readJson, textField } from "@/lib/http";
import { appendLocalJsonl } from "@/lib/local-store";
import { recentCount } from "@/lib/queries";
import { addToAudience } from "@/lib/resend-sync";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return Response.json({ error: "Send JSON." }, { status: 400 });
  if (honeypotTripped(body)) {
    return Response.json({ message: "You’re on the list. Tuesday issue, five builds." });
  }

  const email = textField(body.email, 200)?.toLowerCase();
  const source = textField(body.source, 80) ?? "site";
  if (!email) return Response.json({ error: "Email is required." }, { status: 400 });
  const problem = emailProblem(email);
  if (problem) return Response.json({ error: problem }, { status: 400 });

  const ipHash = clientIpHash(request);
  const sql = await getSql();

  try {
    if (sql) {
      const recent = await recentCount("signups", ipHash);
      if (recent >= 8) {
        return Response.json({ error: "Too many signups from this network. Try again in an hour." }, { status: 429 });
      }
      await sql`
        insert into signups (email, source, ip_hash)
        values (${email}, ${source}, ${ipHash})
        on conflict (email) do nothing
      `;
    } else {
      await appendLocalJsonl("signups.jsonl", { email, source });
    }

    const contactId = await addToAudience(email);
    if (sql && contactId) {
      await sql`
        update signups
        set synced = true, resend_contact_id = ${contactId}
        where email = ${email}
      `;
    }

    return Response.json({ message: "You’re on the list. Tuesday issue, five builds." });
  } catch (error) {
    await logError(error, "/api/signup");
    try {
      await appendLocalJsonl("signups.jsonl", { email, source, failed: true });
      return Response.json({ message: "You’re on the list. Tuesday issue, five builds." });
    } catch {
      return Response.json({ error: "Could not save that email." }, { status: 500 });
    }
  }
}
