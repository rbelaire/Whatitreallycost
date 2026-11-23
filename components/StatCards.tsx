import Link from "next/link";
import { toolName, typeName, typePhrase } from "@/lib/catalog";
import { creditLabel, money } from "@/lib/format";
import type { CreditAverage, DollarAverage } from "@/lib/types";

export function StatCards({
  dollars,
  credits,
}: {
  dollars: DollarAverage[];
  credits: CreditAverage[];
}) {
  if (dollars.length === 0 && credits.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-card px-4 py-5 text-sm text-muted">
        Averages show up once a build states a dollar total or a credit total. Credits stay in their own unit.
        A Lovable credit is not a Base44 credit.
      </p>
    );
  }

  return (
    <div>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory">
        {dollars.map((card) => (
          <Link
            key={card.appType}
            href={`/types/${card.appType}`}
            className="snap-start w-[15.5rem] shrink-0 rounded-2xl border border-line bg-card p-4 shadow-[var(--shadow)]"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Average to build {typePhrase(card.appType)}
            </p>
            <p className="mt-2 font-serif text-4xl leading-none text-ink">{money(card.average)}</p>
            <p className="mt-2 text-sm text-muted">
              Mean of {card.samples} {card.samples === 1 ? "report" : "reports"}. Lowest {money(card.lowest)}.
            </p>
          </Link>
        ))}
        {credits.slice(0, dollars.length > 0 ? 2 : 4).map((card) => (
          <Link
            key={`${card.tool}-${card.appType}`}
            href={`/tools/${card.tool}`}
            className="snap-start w-[15.5rem] shrink-0 rounded-2xl border border-line bg-card p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {toolName(card.tool)} credits · {typeName(card.appType)}
            </p>
            <p className="mt-2 font-serif text-4xl leading-none text-ink">{creditLabel(card.average)}</p>
            <p className="mt-2 text-sm text-muted">
              Mean of {card.samples} {card.samples === 1 ? "report" : "reports"}. Not dollars.
            </p>
          </Link>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">
        Means use only the number each source stated. Open a build to see what was left out.
      </p>
    </div>
  );
}
