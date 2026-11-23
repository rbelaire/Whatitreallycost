import { adminDenied, databaseRequired } from "@/lib/admin";
import { adminStats } from "@/lib/queries";

export async function GET(request: Request) {
  const denied = await adminDenied(request);
  if (denied) return denied;
  const missing = await databaseRequired();
  if (missing) return missing;
  const stats = await adminStats();
  return Response.json(stats);
}
