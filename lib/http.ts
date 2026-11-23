import { createHash } from "node:crypto";

export function clientIpHash(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`${ip}|what-it-really-cost`).digest("hex");
}

export function honeypotTripped(body: Record<string, unknown>): boolean {
  const value = body.company_website;
  return typeof value === "string" && value.trim().length > 0;
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const value = await request.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function textField(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

export function optionalText(value: unknown, max: number): string | null {
  if (value == null || value === "") return null;
  return textField(value, max);
}

/** null when blank, "bad" when present but not a finite non-negative number. */
export function optionalNumber(value: unknown): number | null | "bad" {
  if (value == null || value === "") return null;
  const number = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(number) || number < 0) return "bad";
  return number;
}

export function optionalBool(value: unknown): boolean | null | "bad" {
  if (value == null || value === "" || value === "unsure") return null;
  if (value === true || value === "yes" || value === "true") return true;
  if (value === false || value === "no" || value === "false") return false;
  return "bad";
}

export function httpUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return slug || "build";
}

export function isSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 80;
}
