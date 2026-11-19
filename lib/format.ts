export function money(value: number): string {
  const fractionDigits = Number.isInteger(value) ? 0 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function creditLabel(value: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
  return `${formatted} ${value === 1 ? "credit" : "credits"}`;
}

export function tokenLabel(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const digits = Number.isInteger(millions) ? 0 : 1;
    return `${millions.toLocaleString("en-US", { maximumFractionDigits: digits })}M tokens`;
  }
  return `${value.toLocaleString("en-US")} tokens`;
}

export function dayLabel(value: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value);
  return `${formatted} ${value === 1 ? "day" : "days"}`;
}

export function promptLabel(value: number): string {
  return `${value.toLocaleString("en-US")} ${value === 1 ? "prompt" : "prompts"}`;
}

export type CostFields = {
  dollars: number | null;
  credits: number | null;
  tokens: number | null;
  prompts: number | null;
  days: number | null;
};

export function costParts(build: CostFields): string[] {
  const parts: string[] = [];
  if (build.dollars != null) parts.push(money(build.dollars));
  if (build.credits != null) parts.push(creditLabel(build.credits));
  if (build.tokens != null) parts.push(tokenLabel(build.tokens));
  if (build.prompts != null) parts.push(promptLabel(build.prompts));
  if (build.days != null) parts.push(dayLabel(build.days));
  return parts;
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
