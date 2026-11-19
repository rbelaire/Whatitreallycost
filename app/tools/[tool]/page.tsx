import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuildList } from "@/components/BuildList";
import { toolBySlug, toolName, typePhrase } from "@/lib/catalog";
import { creditLabel, money, tokenLabel } from "@/lib/format";
import { dollarAverages, listBuilds, toolSummary } from "@/lib/queries";
import { SITE_NAME } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>;
}): Promise<Metadata> {
  const { tool } = await params;
  const name = toolName(tool);
  const title = `What it really costs to build on ${name}`;
  return {
    title,
    description: `Reported credits, tokens, and dollars for apps built with ${name}. Every number links to the post that stated it.`,
    openGraph: { title: `${title} · ${SITE_NAME}` },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ tool: string }> }) {
  const { tool } = await params;
  const known = toolBySlug(tool);
  const [builds, summary, averages] = await Promise.all([
    listBuilds({ tool }),
    toolSummary(tool),
    dollarAverages(tool),
  ]);
  if (!known && builds.length === 0) notFound();
  const name = known?.name ?? toolName(tool);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <p className="text-sm text-muted">
        <Link href="/" className="underline">
          All builds
        </Link>
      </p>
      <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight">What it really costs to build on {name}</h1>
      <p className="mt-3 max-w-xl text-muted">
        {known?.summary ?? "Reported builds that name this tool."} Averages only include figures the source actually stated.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Builds" value={String(summary.builds)} />
        <Stat label="Shipped" value={String(summary.shipped)} />
        <Stat
          label="Mean dollars"
          value={summary.avgDollars == null ? "—" : money(summary.avgDollars)}
          detail={summary.dollarSamples ? `${summary.dollarSamples} stated` : "none stated"}
        />
        <Stat
          label={summary.creditSamples ? "Mean credits" : "Mean tokens"}
          value={
            summary.avgCredits != null
              ? creditLabel(summary.avgCredits)
              : summary.avgTokens != null
                ? tokenLabel(summary.avgTokens)
                : "—"
          }
          detail={
            summary.creditSamples
              ? `${summary.creditSamples} stated`
              : summary.tokenSamples
                ? `${summary.tokenSamples} stated`
                : "none stated"
          }
        />
      </dl>

      {averages.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2 text-sm">
          {averages.map((item) => (
            <li key={item.appType}>
              <Link href={`/types/${item.appType}`} className="rounded-full bg-pine-soft px-3 py-1 text-pine">
                {typePhrase(item.appType)} {money(item.average)}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-8">
        {builds.length > 0 ? (
          <BuildList builds={builds} />
        ) : (
          <p className="rounded-2xl border border-dashed border-line bg-card px-4 py-6 text-sm text-muted">
            No reported {name} builds yet. If you have a public post with a real number,{" "}
            <Link className="underline" href="/submit">
              submit it
            </Link>
            .
          </p>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-3">
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 font-serif text-2xl leading-none">{value}</dd>
      {detail ? <dd className="mt-1 text-xs text-muted">{detail}</dd> : null}
    </div>
  );
}
