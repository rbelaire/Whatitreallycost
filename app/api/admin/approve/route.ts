import { adminDenied, databaseRequired } from "@/lib/admin";
import { httpUrl, isSlug, optionalBool, optionalNumber, optionalText, readJson, textField } from "@/lib/http";
import { reviewSubmission, type ReviewEdits } from "@/lib/review";

export async function POST(request: Request) {
  const denied = await adminDenied(request);
  if (denied) return denied;
  const missing = await databaseRequired();
  if (missing) return missing;

  const body = await readJson(request);
  if (!body) return Response.json({ error: "Send JSON." }, { status: 400 });
  const id = textField(body.id, 80);
  const decision = body.decision === "approve" || body.decision === "reject" ? body.decision : null;
  if (!id || !decision) {
    return Response.json({ error: "id and decision (approve or reject) are required." }, { status: 400 });
  }

  const edits = editsFrom(body.edits);
  if (edits === "bad") return Response.json({ error: "Edits are not valid." }, { status: 400 });

  const result = await reviewSubmission(id, decision, edits);
  if (!result.ok) return Response.json({ error: result.error }, { status: result.status });
  return Response.json({ ok: true, buildSlug: result.buildSlug ?? null });
}

function editsFrom(value: unknown): ReviewEdits | "bad" {
  if (value == null) return {};
  if (typeof value !== "object" || Array.isArray(value)) return "bad";
  const edits = value as Record<string, unknown>;
  const credits = optionalNumber(edits.credits);
  const tokens = optionalNumber(edits.tokens);
  const dollars = optionalNumber(edits.dollars);
  const prompts = optionalNumber(edits.prompts);
  const days = optionalNumber(edits.days);
  const shipped = optionalBool(edits.shipped);
  if ([credits, tokens, dollars, prompts, days, shipped].includes("bad")) return "bad";

  const tool = edits.tool == null ? undefined : textField(edits.tool, 40);
  const appType = edits.appType == null ? undefined : textField(edits.appType, 40);
  if ((tool && !isSlug(tool)) || (appType && !isSlug(appType))) return "bad";
  const sourceUrl = edits.sourceUrl == null ? undefined : httpUrl(edits.sourceUrl);
  if (edits.sourceUrl != null && !sourceUrl) return "bad";

  const next: ReviewEdits = {};
  if (tool) next.tool = tool;
  if (appType) next.appType = appType;
  if (edits.title != null) {
    const title = textField(edits.title, 160);
    if (!title) return "bad";
    next.title = title;
  }
  if ("description" in edits) next.description = optionalText(edits.description, 4000);
  if (credits !== "bad" && edits.credits !== undefined) next.credits = credits;
  if (tokens !== "bad" && edits.tokens !== undefined) next.tokens = tokens;
  if (dollars !== "bad" && edits.dollars !== undefined) next.dollars = dollars;
  if (prompts !== "bad" && edits.prompts !== undefined) next.prompts = prompts;
  if (days !== "bad" && edits.days !== undefined) next.days = days;
  if (shipped !== "bad" && edits.shipped !== undefined) next.shipped = shipped;
  if (sourceUrl) next.sourceUrl = sourceUrl;
  if ("authorName" in edits) next.authorName = optionalText(edits.authorName, 120);
  return next;
}
