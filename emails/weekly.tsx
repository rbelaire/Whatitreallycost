import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "react-email";
import type { NewsletterPick, WeeklyProps } from "@/lib/newsletter-data";

const fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

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
  const root = siteUrl.replace(/\/$/, "");
  const submitUrl = `${root}/submit`;
  const sponsorUrl = `${root}/sponsor`;

  return (
    <Html lang="en">
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
          theme: {
            extend: {
              fontFamily: { sans: [fontFamily] },
              colors: {
                ink: "#1c1917",
                pine: "#0d6a50",
                canvas: "#f4f2ee",
                card: "#ffffff",
                muted: "#6b6560",
                line: "#e7e3dc",
                pill: "#f3f1ec",
                pineSoft: "#f3faf7",
              },
            },
          },
        }}
      >
        <Head>
          <meta name="color-scheme" content="light" />
          <meta name="supported-color-schemes" content="light" />
        </Head>
        <Body className="bg-canvas font-sans text-ink" style={{ fontFamily }}>
          <Preview>Five real build costs. The cheapest, the priciest, and one average.</Preview>
          <Container className="px-3 py-8" style={{ maxWidth: "600px" }}>
            <Section
              className="overflow-hidden rounded-2xl bg-card"
              style={{ border: "1px solid #e7e3dc" }}
            >
              <Section className="px-6 pt-7 pb-5">
                <Heading as="h1" className="m-0 text-xl font-semibold leading-6 tracking-tight text-ink">
                  What It Really Cost
                </Heading>
                <Text className="mt-1 mb-0 text-sm leading-5 text-muted">
                  Real bills for AI-built apps. Not plan prices.
                </Text>
                <Text className="mt-3 mb-0 text-xs leading-4 text-muted">Weekly · {issueDate}</Text>
              </Section>

              <Hr className="m-0" style={{ border: "none", borderTop: "1px solid #e7e3dc" }} />

              <Section className="px-6 pt-5 pb-2">
                <Text className="m-0 text-xs font-semibold uppercase tracking-wide text-muted">Five picks</Text>
              </Section>

              {picks.length === 0 ? (
                <Section className="px-6 pb-5">
                  <Text className="m-0 text-sm leading-5 text-muted">No builds are in the ledger yet.</Text>
                </Section>
              ) : (
                picks.map((pick, index) => (
                  <BuildRow key={pick.href} pick={pick} divider={index < picks.length - 1} />
                ))
              )}

              <Section className="bg-pineSoft px-6 pt-5 pb-2">
                <Text className="m-0 text-xs font-semibold uppercase tracking-wide text-pine">This week</Text>
                <Text className="mt-1 mb-0 text-sm leading-5 text-muted">{weekNote}</Text>
              </Section>
              {cheapest ? <Highlight label="Cheapest" pick={cheapest} /> : null}
              {priciest ? <Highlight label="Priciest" pick={priciest} /> : null}
              {!cheapest && !priciest ? <Section className="bg-pineSoft px-6 pb-5" /> : null}

              {average ? (
                <Section className="px-6 py-5">
                  <Text className="m-0 text-xs font-semibold uppercase tracking-wide text-muted">Cost to build</Text>
                  <Text className="mt-2 mb-0 text-2xl font-semibold leading-7 text-ink">{average.value}</Text>
                  <Text className="mt-1 mb-0 text-sm leading-5 text-muted">
                    {average.label}. From {average.samples}{" "}
                    {average.samples === 1 ? "stated dollar total" : "stated dollar totals"}. Credits and tokens stay
                    in their own unit.
                  </Text>
                </Section>
              ) : (
                <Section className="px-6 py-5">
                  <Text className="m-0 text-sm leading-5 text-muted">
                    No dollar average yet. Credits and tokens are not converted into dollars.
                  </Text>
                </Section>
              )}

              <Hr className="m-0" style={{ border: "none", borderTop: "1px solid #e7e3dc" }} />

              <Section className="px-6 py-6">
                <Text className="m-0 text-center">
                  <Button
                    href={submitUrl}
                    className="box-border rounded-full bg-pine px-5 py-3 text-center text-sm font-semibold text-white no-underline"
                  >
                    Submit your build
                  </Button>
                </Text>
                <Text className="mt-3 mb-0 text-center text-sm leading-5">
                  <Link href={root} className="text-pine underline">
                    See the full leaderboard
                  </Link>
                </Text>
              </Section>

              <Section className="px-6 pb-6">
                <Section className="rounded-xl bg-canvas px-4 py-4" style={{ border: "1px solid #e7e3dc" }}>
                  <Text className="m-0 text-xs font-semibold uppercase tracking-wide text-muted">Sponsor</Text>
                  {sponsor ? (
                    <>
                      <Text className="mt-2 mb-0 text-base font-semibold leading-5 text-ink">
                        <Link href={sponsor.href} className="text-ink no-underline">
                          {sponsor.name}
                        </Link>
                      </Text>
                      {sponsor.tagline ? (
                        <Text className="mt-1 mb-0 text-sm leading-5 text-muted">{sponsor.tagline}</Text>
                      ) : (
                        <Text className="mt-1 mb-0 text-sm leading-5 text-muted">
                          A mention in this issue and a slot on the site.
                        </Text>
                      )}
                    </>
                  ) : (
                    <>
                      <Text className="mt-2 mb-0 text-sm font-medium leading-5 text-ink">No sponsor this week.</Text>
                      <Text className="mt-1 mb-0 text-sm leading-5 text-muted">
                        The slot is $29 a week: a bar on the site and a mention here.{" "}
                        <Link href={sponsorUrl} className="text-pine underline">
                          Get in touch
                        </Link>
                      </Text>
                    </>
                  )}
                </Section>
              </Section>
            </Section>

            <Section className="px-4 pt-5">
              <Text className="m-0 text-center text-xs leading-5 text-muted">
                You got this because you signed up for the weekly ledger of real AI-build costs.
              </Text>
              <Text className="mt-2 mb-0 text-center text-xs leading-5">
                <Link href="{{{RESEND_UNSUBSCRIBE_URL}}}" className="text-muted underline">
                  Unsubscribe
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

function BuildRow({ pick, divider }: { pick: NewsletterPick; divider: boolean }) {
  return (
    <Section
      className="px-6 py-4"
      style={divider ? { borderBottom: "1px solid #e7e3dc" } : undefined}
    >
      <PickBody pick={pick} />
    </Section>
  );
}

function Highlight({ label, pick }: { label: string; pick: NewsletterPick }) {
  return (
    <Section className="bg-pineSoft px-6 pt-3 pb-4">
      <Text className="m-0 text-xs font-semibold uppercase tracking-wide text-pine">{label}</Text>
      <PickBody pick={pick} />
    </Section>
  );
}

function PickBody({ pick }: { pick: NewsletterPick }) {
  return (
    <Row>
      <Column valign="top" style={{ paddingRight: "16px" }}>
        <Link href={pick.href} className="mt-1 inline-block text-base font-semibold leading-5 text-ink no-underline">
          {pick.title}
        </Link>
        {pick.blurb ? <Text className="mt-1 mb-0 text-sm leading-5 text-muted">{pick.blurb}</Text> : null}
        <Text className="mt-2 mb-0 text-xs leading-5">
          <span className="mr-1 inline-block rounded-full bg-pill px-2 py-0.5 font-medium text-ink">{pick.tool}</span>
          <span className="inline-block rounded-full bg-pill px-2 py-0.5 font-medium text-ink">{pick.appType}</span>
        </Text>
        {pick.detail ? <Text className="mt-2 mb-0 text-xs leading-4 text-muted">{pick.detail}</Text> : null}
      </Column>
      <Column valign="top" width="112" align="right" className="align-top">
        <Text
          className={`m-0 text-right text-lg font-semibold leading-6 ${pick.cost === "Not stated" ? "text-muted" : "text-ink"}`}
        >
          {pick.cost}
        </Text>
      </Column>
    </Row>
  );
}

const previewPick = (
  title: string,
  href: string,
  blurb: string,
  tool: string,
  appType: string,
  cost: string,
  detail: string,
): NewsletterPick => ({ title, href, blurb, tool, appType, cost, detail });

Object.assign(WeeklyEmail, {
  PreviewProps: {
    siteUrl: "https://cost.belairestudio.com",
    issueDate: "Tuesday, November 17, 2026",
    picks: [
      previewPick(
        "Karrot",
        "https://cost.belairestudio.com/builds/karrot-lovable",
        "A marketing checklist SaaS. The author stated about $95 and 357 credits.",
        "Lovable",
        "SaaS",
        "$95",
        "357 credits",
      ),
      previewPick(
        "A Lyon yoga studio booking app",
        "https://cost.belairestudio.com/builds/lyon-yoga-booking-bolt",
        "Booking, payments, and a studio site, logged phase by phase.",
        "Bolt",
        "SaaS",
        "450k tokens",
        "7 days",
      ),
      previewPick(
        "Calcy.net",
        "https://cost.belairestudio.com/builds/calcy-cursor",
        "A calculator site. The author wrote the cost to develop was $0.",
        "Cursor",
        "Utility",
        "$0",
        "7 days",
      ),
      previewPick(
        "A small ratings directory on v0",
        "https://cost.belairestudio.com/builds/v0-ratings-directory",
        "Two generations on v0, then published.",
        "v0",
        "Directory",
        "$1.59",
        "2 prompts",
      ),
      previewPick(
        "GetHyred",
        "https://cost.belairestudio.com/builds/gethyred-replit",
        "A job-search app built in Replit over two weeks.",
        "Replit",
        "SaaS",
        "$691",
        "14 days",
      ),
    ],
    cheapest: previewPick(
      "Calcy.net",
      "https://cost.belairestudio.com/builds/calcy-cursor",
      "A calculator site. The author wrote the cost to develop was $0.",
      "Cursor",
      "Utility",
      "$0",
      "7 days",
    ),
    priciest: previewPick(
      "A pre-launch app on Base44",
      "https://cost.belairestudio.com/builds/unnamed-prelaunch-app-base44",
      "Three invoices, from Builder to Elite, before any end users.",
      "Base44",
      "SaaS",
      "$1,881",
      "11 days",
    ),
    average: { label: "Average reported cost to build a SaaS", value: "$442", samples: 9 },
    sponsor: null,
    weekNote: "Cheapest and priciest use builds added in the last 7 days that stated a dollar total.",
  } satisfies WeeklyProps,
});
