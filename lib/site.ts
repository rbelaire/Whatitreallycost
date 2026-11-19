export const SITE_NAME = "What It Really Cost";

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://cost.belairestudio.com";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
