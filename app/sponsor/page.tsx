import type { Metadata } from "next";
import { SponsorForm } from "@/components/SponsorForm";
import { databaseReady } from "@/lib/db";
import { publicStats } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Sponsor the ledger",
  description: "A site slot and a newsletter mention for $29 a week. Live counts from the database. No checkout.",
};

export default async function SponsorPage() {
  const [ready, stats] = await Promise.all([databaseReady(), publicStats()]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <p className="text-sm font-medium text-pine">$29 a week</p>
      <h1 className="mt-2 max-w-xl font-serif text-4xl leading-tight">Sponsor the place people check before they pay for an AI builder.</h1>
      <p className="mt-3 max-w-xl text-muted">
        One week is a bar on the site, a “Sponsored by” line, and a mention in the Tuesday email. Clicks go through
        a counted redirect. There is no checkout on this page.
      </p>

      <section className="mt-8" aria-label="Live stats">
        <h2 className="font-serif text-2xl">Live from the database</h2>
        {ready ? (
          <dl className="mt-3 grid grid-cols-3 gap-3">
            <Tile label="Builds" value={stats.builds.toLocaleString("en-US")} />
            <Tile label="Subscribers" value={stats.subscribers.toLocaleString("en-US")} />
            <Tile label="Pageviews this month" value={stats.monthlyPageviews.toLocaleString("en-US")} />
          </dl>
        ) : (
          <p className="mt-3 rounded-2xl border border-dashed border-line bg-card px-4 py-5 text-sm text-muted">
            The database isn’t connected, so the live counts aren’t available. The offer is still $29 a week for the
            site slot and a newsletter mention.
          </p>
        )}
      </section>

      <section className="mt-10 max-w-xl">
        <h2 className="font-serif text-2xl">Get in touch</h2>
        <div className="mt-4">
          <SponsorForm />
        </div>
      </section>
    </main>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-3">
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 font-serif text-3xl leading-none">{value}</dd>
    </div>
  );
}
