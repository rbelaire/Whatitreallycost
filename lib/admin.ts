import { hasDatabase, prepareRequest } from "./db";

export async function adminDenied(request: Request): Promise<Response | null> {
  await prepareRequest();
  const token = process.env.ADMIN_TOKEN?.trim();
  const header = request.headers.get("authorization") ?? "";
  if (!token || header !== `Bearer ${token}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function databaseRequired(): Promise<Response | null> {
  await prepareRequest();
  if (!hasDatabase()) {
    return Response.json({ error: "DATABASE_URL is not set" }, { status: 503 });
  }
  return null;
}
