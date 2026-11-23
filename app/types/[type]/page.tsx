import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuildList } from "@/components/BuildList";
import { typeBySlug, typeName, typePhrase } from "@/lib/catalog";
import { money } from "@/lib/format";
import { dollarAverages, listBuilds } from "@/lib/queries";
import { SITE_NAME } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const title = `What ${typePhrase(type)} costs to build`;
  return {
    title,
    description: `Reported cost of building ${typePhrase(type)} with AI app builders. Only numbers a public source stated.`,
    openGraph: { title: `${title} · ${SITE_NAME}` },
  };
}

export default async function TypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const known = typeBySlug(type);
  const [builds, averages] = await Promise.all([listBuilds({ type }), dollarAverages()]);
  const average = averages.find((item) => item.appType === type);
  if (!known && builds.length === 0) notFound();
  const phrase = typePhrase(type);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <p className="text-sm text-muted">
        <Link href="/" className="underline">
          All builds
        </Link>
      </p>
      <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight capitalize">What {phrase} costs to build</h1>
      <p className="mt-3 max-w-xl text-muted">
        {average
          ? `The mean reported dollar total for ${phrase} is ${money(average.average)}, from ${average.samples} ${average.samples === 1 ? "build" : "builds"}. The lowest stated is ${money(average.lowest)}.`
          : `No build of ${typeName(type).toLowerCase()} in the ledger has stated a dollar total yet. Credits and tokens are listed on each build, in the unit the source used.`}
      </p>
      <div className="mt-8">
        {builds.length > 0 ? (
          <BuildList builds={builds} />
        ) : (
          <p className="rounded-2xl border border-dashed border-line bg-card px-4 py-6 text-sm text-muted">
            No {typeName(type).toLowerCase()} builds yet.
          </p>
        )}
      </div>
    </main>
  );
}
