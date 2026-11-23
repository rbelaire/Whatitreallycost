import { getSql, logError } from "@/lib/db";
import {
  clientIpHash,
  honeypotTripped,
  httpUrl,
  isSlug,
  optionalBool,
  optionalNumber,
  optionalText,
  readJson,
  textField,
} from "@/lib/http";
import { emailProblem } from "@/lib/email-guard";
import { recentCount } from "@/lib/queries";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return Response.json({ error: "Send JSON." }, { status: 400 });
  if (honeypotTripped(body)) {
    return Response.json({ message: "Saved for review. It will not go live until someone checks the source." });
  }

  const title = textField(body.title, 160);
  const tool = textField(body.tool, 40);
  const appType = textField(body.appType, 40);
  const description = optionalText(body.description, 4000);
  const sourceUrl = httpUrl(body.sourceUrl);
  const authorName = optionalText(body.authorName, 120);
  const email = optionalText(body.email, 200);
  const credits = optionalNumber(body.credits);
  const tokens = optionalNumber(body.tokens);
  const dollars = optionalNumber(body.dollars);
  const prompts = optionalNumber(body.prompts);
  const days = optionalNumber(body.days);
  const shipped = optionalBool(body.shipped);

  if (!title || !tool || !appType || !isSlug(tool) || !isSlug(appType)) {
    return Response.json({ error: "Title, tool, and app type are required." }, { status: 400 });
  }
  if (!sourceUrl) return Response.json({ error: "A public http(s) source link is required." }, { status: 400 });
  if ([credits, tokens, dollars, prompts, days, shipped].includes("bad")) {
    return Response.json({ error: "Numbers have to be zero or greater." }, { status: 400 });
  }
  if (![credits, tokens, dollars].some((value) => typeof value === "number")) {
    return Response.json({ error: "Add at least one of credits, tokens, or dollars." }, { status: 400 });
  }
  if (email && emailProblem(email)) {
    return Response.json({ error: "That email doesn’t look usable. You can leave it blank." }, { status: 400 });
  }

  const sql = await getSql();
  if (!sql) {
    return Response.json(
      { error: "The review queue isn’t connected yet. Nothing was saved." },
      { status: 503 },
    );
  }

  const ipHash = clientIpHash(request);
  try {
    const recent = await recentCount("submissions", ipHash);
    if (recent >= 5) {
      return Response.json({ error: "Too many submissions from this network. Try again in an hour." }, { status: 429 });
    }
    await sql`
      insert into submissions (
        tool, app_type, title, description, credits, tokens, dollars, prompts, days,
        shipped, source_url, author_name, email, ip_hash
      ) values (
        ${tool}, ${appType}, ${title}, ${description},
        ${credits as number | null}, ${tokens as number | null}, ${dollars as number | null},
        ${prompts as number | null}, ${days as number | null},
        ${shipped as boolean | null}, ${sourceUrl}, ${authorName}, ${email}, ${ipHash}
      )
    `;
    return Response.json({
      message: "Saved for review. It will not go live until someone checks the source.",
    });
  } catch (error) {
    await logError(error, "/api/submit");
    return Response.json({ error: "Could not save that submission." }, { status: 500 });
  }
}
