export type ToolInfo = {
  slug: string;
  name: string;
  summary: string;
};

export type AppTypeInfo = {
  slug: string;
  name: string;
  /** Phrase used in “what ___ costs”, e.g. “a SaaS”. */
  phrase: string;
};

export const TOOLS: ToolInfo[] = [
  {
    slug: "lovable",
    name: "Lovable",
    summary: "Chat-built web apps. Usage is measured in credits.",
  },
  {
    slug: "bolt",
    name: "Bolt",
    summary: "Browser builder from StackBlitz. Usage is measured in tokens.",
  },
  {
    slug: "replit",
    name: "Replit",
    summary: "Hosted IDE with an agent. Usage is measured in dollars.",
  },
  {
    slug: "cursor",
    name: "Cursor",
    summary: "AI code editor. Plans include a usage pool, then on-demand spend.",
  },
  {
    slug: "v0",
    name: "v0",
    summary: "Vercel’s app and UI builder. Messages draw down a dollar balance.",
  },
  {
    slug: "claude-code",
    name: "Claude Code",
    summary: "Anthropic’s coding agent, usually on a Claude plan.",
  },
  {
    slug: "claude",
    name: "Claude",
    summary: "Claude chat used as the builder, when the source says chat rather than Claude Code.",
  },
  {
    slug: "windsurf",
    name: "Windsurf",
    summary: "Agentic IDE. Usage is a credit or quota allowance.",
  },
  {
    slug: "base44",
    name: "Base44",
    summary: "Wix’s app builder. Usage is split into message and integration credits.",
  },
];

export const APP_TYPES: AppTypeInfo[] = [
  { slug: "landing-page", name: "Landing page", phrase: "a landing page" },
  { slug: "website", name: "Website", phrase: "a website" },
  { slug: "saas", name: "SaaS", phrase: "a SaaS" },
  { slug: "crm", name: "CRM", phrase: "a CRM" },
  { slug: "habit-tracker", name: "Habit tracker", phrase: "a habit tracker" },
  { slug: "game", name: "Game", phrase: "a game" },
  { slug: "internal-tool", name: "Internal tool", phrase: "an internal tool" },
  { slug: "mobile-app", name: "Mobile app", phrase: "a mobile app" },
  { slug: "marketplace", name: "Marketplace", phrase: "a marketplace" },
  { slug: "directory", name: "Directory", phrase: "a directory" },
  { slug: "utility", name: "Utility", phrase: "a utility" },
  { slug: "ai-tool", name: "AI tool", phrase: "an AI tool" },
  { slug: "portfolio", name: "Portfolio", phrase: "a portfolio" },
];

export function toolBySlug(slug: string): ToolInfo | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}

export function typeBySlug(slug: string): AppTypeInfo | undefined {
  return APP_TYPES.find((type) => type.slug === slug);
}

export function toolName(slug: string): string {
  return toolBySlug(slug)?.name ?? titleFromSlug(slug);
}

export function typeName(slug: string): string {
  return typeBySlug(slug)?.name ?? titleFromSlug(slug);
}

export function typePhrase(slug: string): string {
  return typeBySlug(slug)?.phrase ?? `a ${typeName(slug).toLowerCase()}`;
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
