import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "react-email";
import type { WeeklyProps } from "@/lib/newsletter-data";

export default function WeeklyEmail({
  siteUrl,
  issueDate,
  picks,
  cheapest,
  priciest,
  average,
  sponsor,
  weekNote,
}: WeeklyProps) {
  return (
    <Html lang="en">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              colors: {
                ink: "#1c1712",
                pine: "#0d6a50",
                paper: "#f4efe6",
                muted: "#5f574c",
              },
            },
          },
        }}
      >
        <Head />
        <Body className="bg-paper font-sans text-ink">
          <Preview>Five real build costs, plus the cheapest and priciest of the week.</Preview>
          <Container className="mx-auto my-0 bg-white px-6 py-8">
            <Text className="m-0 text-xs uppercase tracking-wide text-pine">What It Really Cost</Text>
            <Heading as="h1" className="mt-2 mb-1 text-2xl leading-tight text-ink">
              Tuesday, {issueDate}
            </Heading>
            <Text className="mt-0 text-sm text-muted">
              Five builds from the ledger. Each line links back to the source on the site.
            </Text>

            <Heading as="h2" className="mt-6 mb-2 text-lg text-ink">
              Five picks
            </Heading>
            {picks.length === 0 ? (
              <Text className="text-base text-ink">No builds are in the ledger yet.</Text>
            ) : (
              picks.map((pick) => (
                <Text key={pick.href} className="my-2 text-base leading-snug text-ink">
                  <Link href={pick.href} className="text-pine underline">
                    {pick.title}
                  </Link>
                  {" — "}
                  {pick.line}
                </Text>
              ))
            )}

            <Hr className="my-6 border-solid border-neutral-200" />

            <Heading as="h2" className="mt-0 mb-2 text-lg text-ink">
              Cheapest and priciest
            </Heading>
            <Text className="text-sm text-muted">{weekNote}</Text>
            {cheapest ? (
              <Text className="text-base text-ink">
                Cheapest:{" "}
                <Link href={cheapest.href} className="text-pine underline">
                  {cheapest.title}
                </Link>
                {" — "}
                {cheapest.line}
              </Text>
            ) : null}
            {priciest ? (
              <Text className="text-base text-ink">
                Priciest:{" "}
                <Link href={priciest.href} className="text-pine underline">
                  {priciest.title}
                </Link>
                {" — "}
                {priciest.line}
              </Text>
            ) : null}

            <Heading as="h2" className="mt-6 mb-2 text-lg text-ink">
              Cost to build
            </Heading>
            {average ? (
              <Text className="text-base text-ink">
                {average.label}: {average.value}, from {average.samples}{" "}
                {average.samples === 1 ? "stated dollar total" : "stated dollar totals"}.
              </Text>
            ) : (
              <Text className="text-base text-ink">No dollar average yet. Credits and tokens are not converted.</Text>
            )}

            <Hr className="my-6 border-solid border-neutral-200" />
            <Text className="text-base text-ink">
              Sponsored by{" "}
              {sponsor ? (
                <Link href={sponsor.href} className="text-pine underline">
                  {sponsor.name}
                </Link>
              ) : (
                "nobody this week"
              )}
              .
            </Text>
            <Text className="text-sm text-muted">
              <Link href={siteUrl} className="text-pine underline">
                Open the ledger
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

Object.assign(WeeklyEmail, {
  PreviewProps: {
  siteUrl: "https://cost.belairestudio.com",
  issueDate: "November 17, 2026",
  picks: [
    {
      title: "Karrot",
      href: "https://cost.belairestudio.com/builds/karrot-lovable",
      line: "Lovable · SaaS · $95 · 357 credits",
    },
  ],
  cheapest: {
    title: "Calcy.net",
    href: "https://cost.belairestudio.com/builds/calcy-cursor",
    line: "Cursor · Utility · $0",
  },
  priciest: {
    title: "A pre-launch app on Base44",
    href: "https://cost.belairestudio.com/builds/unnamed-prelaunch-app-base44",
    line: "Base44 · SaaS · $1,881",
  },
  average: { label: "Average reported cost to build a SaaS", value: "$412", samples: 8 },
  sponsor: null,
  weekNote: "Cheapest and priciest use builds added in the last 7 days that stated a dollar total.",
} satisfies WeeklyProps,
});
