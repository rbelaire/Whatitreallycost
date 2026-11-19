import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuildList, Shipped } from "@/components/BuildList";
import { SignupForm } from "@/components/SignupForm";
import { toolName, typeName } from "@/lib/catalog";
import { costParts, hostOf } from "@/lib/format";
import { getBuild, relatedBuilds } from "@/lib/queries";
import { SITE_NAME } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const build = await getBuild(slug);
  if (!build) return { title: "Build" };
  const cost = costParts(build).join(" · ") || "cost not fully stated";
  const title = `${build.title}: ${cost}`;
  return {
    title: build.title,
    description: `${build.title} on ${toolName(build.tool)}. ${cost}. Source: ${hostOf(build.sourceUrl)}.`,
    openGraph: { title: `${title} · ${SITE_NAME}` },
  };
}

export default async function BuildPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const build = await getBuild(slug);
  if (!build) notFound();
  const related = await relatedBuilds(build);
  const parts = costParts(build);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <p className="text-sm text-muted">
        <Link href="/" className="underline">
          All builds
        </Link>
        <span className="px-2">/</span>
        <Link href={`/tools/${build.tool}`} className="underline">
          {toolName(build.tool)}
        </Link>
        <span className="px-2">/</span>
        <Link href={`/types/${build.appType}`} className="underline">
          {typeName(build.appType)}
        </Link>
      </p>
      <div className="mt-4 flex items-start justify-between gap-3">
        <h1 className="font-serif text-4xl leading-tight">{build.title}</h1>
        <Shipped shipped={build.shipped} />
      </div>
      {build.authorName ? <p className="mt-2 text-sm text-muted">Reported by {build.authorName}</p> : null}

      <p className="mt-4 font-mono text-lg">{parts.length ? parts.join(" · ") : "No numeric cost was stored."}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <Fact label="Dollars" value={build.dollars} />
        <Fact label="Credits" value={build.credits} />
        <Fact label="Tokens" value={build.tokens} />
        <Fact label="Prompts" value={build.prompts} />
        <Fact label="Days" value={build.days} />
      </dl>
      <p className="mt-3 text-xs text-muted">A blank field means the source did not state that number. Nothing here is estimated.</p>

      {build.description ? <p className="mt-6 max-w-2xl leading-relaxed">{build.description}</p> : null}

      <a
        href={build.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-flex h-12 items-center rounded-full bg-pine px-5 text-sm font-semibold text-white"
      >
        Read the source on {hostOf(build.sourceUrl)}
      </a>

      <section className="mt-10 max-w-lg rounded-3xl border border-line bg-card p-5">
        <h2 className="font-serif text-2xl">Get the Tuesday five</h2>
        <div className="mt-3">
          <SignupForm source={`build:${build.slug}`} />
        </div>
      </section>

      {related.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-serif text-2xl">Nearby builds</h2>
          <BuildList builds={related} />
        </section>
      ) : null}
    </main>
  );
}

function Fact({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="rounded-xl border border-line bg-card px-3 py-2">
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="font-mono">{value == null ? "Not stated" : value.toLocaleString("en-US")}</dd>
    </div>
  );
}
