const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "mailinator.net",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamail.biz",
  "grr.la",
  "sharklasers.com",
  "10minutemail.com",
  "10minutemail.net",
  "tempmail.com",
  "temp-mail.org",
  "tempmailo.com",
  "yopmail.com",
  "yopmail.fr",
  "trashmail.com",
  "trash-mail.com",
  "discard.email",
  "fakeinbox.com",
  "getnada.com",
  "dispostable.com",
  "maildrop.cc",
  "throwawaymail.com",
  "mohmal.com",
  "emailondeck.com",
  "spamgourmet.com",
  "mailnesia.com",
  "tempail.com",
  "mintemail.com",
  "mytemp.email",
  "mailcatch.com",
  "inboxkitten.com",
  "burnermail.io",
  "spam4.me",
  "tempinbox.com",
  "moakt.com",
  "getairmail.com",
  "dropmail.me",
  "guerrillamailblock.com",
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "test.test",
  "invalid.com",
  "mailnull.com",
]);

/** Returns a short reason to reject, or null when the address is acceptable. */
export function emailProblem(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
    return "That email doesn’t look valid.";
  }
  const [local, domain] = email.split("@");
  if (!local || !domain || local.length < 2) {
    return "That email doesn’t look valid.";
  }
  if (
    DISPOSABLE_DOMAINS.has(domain) ||
    domain.endsWith(".test") ||
    domain.endsWith(".invalid") ||
    domain.endsWith(".example") ||
    domain.startsWith("mailinator.") ||
    domain.includes("tempmail") ||
    domain.includes("trashmail") ||
    domain.includes("guerrillamail")
  ) {
    return "Use an email you actually check. Disposable and test addresses are skipped.";
  }
  if (/^(test|testing|fake|asdf|qwerty|foo|bar|example|noreply|no-reply|abc|aaa)\d*$/.test(local)) {
    return "Use an email you actually check. Disposable and test addresses are skipped.";
  }
  return null;
}
