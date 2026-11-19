export type Build = {
  id: string;
  slug: string;
  tool: string;
  appType: string;
  title: string;
  description: string | null;
  credits: number | null;
  tokens: number | null;
  dollars: number | null;
  prompts: number | null;
  days: number | null;
  shipped: boolean | null;
  sourceUrl: string;
  authorName: string | null;
  createdAt: string;
};

export type Submission = Build & {
  email: string | null;
  status: "pending" | "approved" | "rejected";
  buildId: string | null;
  reviewedAt: string | null;
};

export type SponsorWeek = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  url: string;
  startsOn: string;
  endsOn: string;
  active: boolean;
};

export type DollarAverage = {
  appType: string;
  average: number;
  lowest: number;
  samples: number;
};

export type CreditAverage = {
  tool: string;
  appType: string;
  average: number;
  samples: number;
};

export type BuildFilters = {
  q?: string;
  tool?: string;
  type?: string;
  shipped?: "yes" | "no";
};
