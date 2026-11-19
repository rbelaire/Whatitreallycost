"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
const memory = new Set<string>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function hidden(slug: string): boolean {
  if (memory.has(slug)) return true;
  try {
    return sessionStorage.getItem(`sponsor-hide:${slug}`) === "1";
  } catch {
    return false;
  }
}

function hide(slug: string) {
  memory.add(slug);
  try {
    sessionStorage.setItem(`sponsor-hide:${slug}`, "1");
  } catch {
    // Private mode can block storage. The in-memory flag still closes this view.
  }
  listeners.forEach((listener) => listener());
}

export function SponsorBar({
  name,
  tagline,
  slug,
}: {
  name: string;
  tagline: string | null;
  slug: string;
}) {
  const closed = useSyncExternalStore(
    subscribe,
    () => hidden(slug),
    () => false,
  );

  if (closed) return null;

  return (
    <div className="bg-ink text-card">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2 text-sm">
        <a href={`/go/${slug}`} className="min-w-0 flex-1 leading-snug hover:underline">
          <span className="font-medium">Sponsored by {name}</span>
          {tagline ? <span className="text-card/80"> — {tagline}</span> : null}
        </a>
        <button
          type="button"
          className="shrink-0 rounded px-2 py-1 text-card/80 underline-offset-2 hover:underline"
          onClick={() => hide(slug)}
        >
          Close
        </button>
      </div>
    </div>
  );
}
