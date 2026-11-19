import { render } from "react-email";
import { adminDenied } from "@/lib/admin";
import WeeklyEmail from "@/emails/weekly";
import { loadWeeklyProps } from "@/lib/newsletter-data";

export async function GET(request: Request) {
  const denied = await adminDenied(request);
  if (denied) return denied;
  const props = await loadWeeklyProps();
  const html = await render(<WeeklyEmail {...props} />);
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
