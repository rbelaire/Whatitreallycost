import { logSponsorClick, sponsorBySlug } from "@/lib/queries";

export async function GET(request: Request, context: { params: Promise<{ sponsor: string }> }) {
  const { sponsor } = await context.params;
  const found = await sponsorBySlug(sponsor);
  if (!found) {
    return new Response("Unknown sponsor", { status: 404 });
  }
  let target: URL;
  try {
    target = new URL(found.url);
  } catch {
    return new Response("Sponsor link is not a valid URL", { status: 404 });
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return new Response("Sponsor link is not a valid URL", { status: 404 });
  }
  const current = new URL(request.url);
  await logSponsorClick(found.slug, current.searchParams.get("from"), request.headers.get("referer"));
  return Response.redirect(target.toString(), 302);
}
