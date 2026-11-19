import Link from "next/link";
import { BuildList } from "@/components/BuildList";
import { FilterForm } from "@/components/FilterForm";
import { SignupForm } from "@/components/SignupForm";
import { StatCards } from "@/components/StatCards";
import { TOOLS, typeName } from "@/lib/catalog";
import { databaseReady } from "@/lib/db";
import { creditAverages, dollarAverages, listBuilds, rememberZeroResult } from "@/lib/queries";
import type { BuildFilters } from "@/lib/types";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters: BuildFilters = {
    q: one(params.q),
    tool: one(params.tool),
    type: one(params.type),
    shipped: one(params.shipped) === "yes" || one(params.shipped) === "no" ? (one(params.shipped) as "yes" | "no") : undefined,
  };
  const [builds, dollars, credits] = await Promise.all([
    listBuilds(filters),
    dollarAverages(),
    creditAverages(),
  ]);
  const filtering = Boolean(filters.q || filters.tool || filters.type || filters.shipped);
  if (filters.q && builds.length === 0) {
    await rememberZeroResult(filters.q, filters);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-10">
      <p className="text-sm font-medium text-pine">For people choosing an AI builder</p>
      <h1 className="mt-2 max-w-xl font-serif text-4xl leading-[1.05] text-ink sm:text-5xl">
        What it really cost to build it.
      </h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
        Plan pages show the sticker price. This is the bill: credits, tokens, or dollars someone said they
        spent on a specific build, with a link to where they said it.
      </p>

      <section className="mt-6" aria-label="Average cost">
        <StatCards dollars={dollars} credits={credits} />
      </section>

      <section className="mt-8" aria-label="Filters">
        <FilterForm filters={filters} />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="shrink-0 rounded-full border border-line bg-card px-3 py-1.5 text-sm hover:border-pine"
            >
              {tool.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-4" aria-label="Builds">
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 className="font-serif text-2xl">
            {filtering ? "Matching builds" : "The ledger"}
            {filters.type ? ` · ${typeName(filters.type)}` : ""}
          </h2>
          <p className="text-sm text-muted">{builds.length}</p>
        </div>
        {builds.length > 0 ? (
          <BuildList builds={builds} />
        ) : (
          <Empty configured={await databaseReady()} filtering={filtering} />
        )}
      </section>

      <section className="mt-10 rounded-3xl bg-ink px-5 py-6 text-card">
        <h2 className="font-serif text-2xl">Five builds, every Tuesday</h2>
        <p className="mt-1 max-w-md text-sm text-card/75">
          The cheapest, the priciest, and what it cost to build one kind of app. No plan-price roundup.
        </p>
        <div className="mt-4 max-w-lg">
          <SignupForm source="home" tone="dark" />
        </div>
      </section>
    </main>
  );
}

function Empty({ configured, filtering }: { configured: boolean; filtering: boolean }) {
  if (!configured) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-card px-4 py-6 text-sm leading-relaxed text-muted">
        No builds are loaded. The site still works without a database. Connect one and the reported costs
        show up here.
      </p>
    );
  }
  if (filtering) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-card px-4 py-6 text-sm text-muted">
        Nothing in the ledger matches that. Try another tool, or{" "}
        <Link className="underline" href="/submit">
          submit the build
        </Link>{" "}
        if you have a source.
      </p>
    );
  }
  return (
    <p className="rounded-2xl border border-dashed border-line bg-card px-4 py-6 text-sm text-muted">
      No approved builds yet. Submissions wait in a review queue until someone checks the source.
    </p>
  );
}

function one(value: string | string[] | undefined): string | undefined {
  const found = Array.isArray(value) ? value[0] : value;
  const trimmed = found?.trim();
  return trimmed ? trimmed : undefined;
}
