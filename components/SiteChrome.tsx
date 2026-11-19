import Link from "next/link";
import { SponsorBar } from "./SponsorBar";
import { SignupForm } from "./SignupForm";
import type { SponsorWeek } from "@/lib/types";

export function SiteHeader({ sponsor }: { sponsor: SponsorWeek | null }) {
  return (
    <header className="border-b border-line bg-paper/95">
      {sponsor ? <SponsorBar name={sponsor.name} tagline={sponsor.tagline} slug={sponsor.slug} /> : null}
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="min-w-0">
          <span className="block font-serif text-lg leading-tight text-ink">What It Really Cost</span>
          <span className="block text-xs text-muted">Real bills, not plan prices</span>
        </Link>
        <nav className="flex shrink-0 items-center gap-4 text-sm font-medium">
          <Link href="/submit" className="hover:text-pine">
            Submit
          </Link>
          <Link href="/sponsor" className="hover:text-pine">
            Sponsor
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ sponsor }: { sponsor: SponsorWeek | null }) {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:grid-cols-2">
        <div>
          <p className="font-serif text-lg">Tuesday’s five builds</p>
          <p className="mt-1 text-sm text-muted">A short email. The cheapest, the priciest, and one average.</p>
          <div className="mt-3">
            <SignupForm source="footer" compact />
          </div>
        </div>
        <div className="text-sm text-muted sm:text-right">
          {sponsor ? (
            <p>
              Sponsored by{" "}
              <a className="font-medium text-ink underline" href={`/go/${sponsor.slug}`}>
                {sponsor.name}
              </a>
            </p>
          ) : (
            <p>
              No sponsor this week.{" "}
              <Link className="font-medium text-ink underline" href="/sponsor">
                The slot is $29/week.
              </Link>
            </p>
          )}
          <p className="mt-3">
            <Link className="underline" href="/submit">
              Add a build
            </Link>
            <span className="px-2">·</span>
            <Link className="underline" href="/sponsor">
              Sponsor
            </Link>
          </p>
          <p className="mt-3">Numbers are what people posted. They are not invoices.</p>
        </div>
      </div>
    </footer>
  );
}
