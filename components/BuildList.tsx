import Link from "next/link";
import { toolName, typeName } from "@/lib/catalog";
import { costParts } from "@/lib/format";
import type { Build } from "@/lib/types";

export function BuildList({ builds }: { builds: Build[] }) {
  if (builds.length === 0) return null;

  return (
    <ol className="divide-y divide-line border-y border-line">
      {builds.map((build) => {
        const parts = costParts(build);
        return (
          <li key={build.slug}>
            <Link href={`/builds/${build.slug}`} className="group block py-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {toolName(build.tool)}
                  <span className="px-1.5 text-line">/</span>
                  {typeName(build.appType)}
                </p>
                <Shipped shipped={build.shipped} />
              </div>
              <h2 className="mt-1 font-serif text-xl leading-snug text-ink group-hover:text-pine">
                {build.title}
              </h2>
              <p className="mt-1 font-mono text-sm text-ink">
                {parts.length ? parts.join(" · ") : "No figure stated"}
              </p>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export function Shipped({ shipped }: { shipped: boolean | null }) {
  if (shipped === true) {
    return (
      <span className="shrink-0 rounded-full bg-pine-soft px-2 py-0.5 text-xs font-semibold text-pine">
        Shipped
      </span>
    );
  }
  if (shipped === false) {
    return (
      <span className="shrink-0 rounded-full bg-stamp-soft px-2 py-0.5 text-xs font-semibold text-stamp">
        Not shipped
      </span>
    );
  }
  return <span className="shrink-0 text-xs text-muted">Ship status not stated</span>;
}
