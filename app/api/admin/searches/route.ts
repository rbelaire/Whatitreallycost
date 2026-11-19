import { adminDenied, databaseRequired } from "@/lib/admin";
import { zeroResultSearches } from "@/lib/queries";

export async function GET(request: Request) {
  const denied = await adminDenied(request);
  if (denied) return denied;
  const missing = await databaseRequired();
  if (missing) return missing;
  const searches = await zeroResultSearches();
  return Response.json({ searches });
}
