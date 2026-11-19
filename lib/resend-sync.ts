import { Resend } from "resend";
import { logError } from "./db";

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export function resendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_AUDIENCE_ID?.trim());
}

/** Add a contact to the configured audience/segment. Returns the contact id or null. */
export async function addToAudience(email: string): Promise<string | null> {
  const resend = client();
  const audienceId = process.env.RESEND_AUDIENCE_ID?.trim();
  if (!resend || !audienceId) return null;

  const segmented = await resend.contacts.create({
    email,
    unsubscribed: false,
    segments: [{ id: audienceId }],
  });
  if (!segmented.error && segmented.data?.id) return segmented.data.id;

  const legacy = await resend.contacts.create({
    audienceId,
    email,
    unsubscribed: false,
  });
  if (!legacy.error && legacy.data?.id) return legacy.data.id;

  await logError(segmented.error ?? legacy.error, "/api/signup", { email });
  return null;
}

export async function notifySponsorLead(input: {
  id: string;
  name: string | null;
  email: string;
  company: string | null;
  message: string | null;
}): Promise<boolean> {
  const resend = client();
  const from = process.env.RESEND_FROM?.trim();
  const recipients = (process.env.SPONSOR_NOTIFY_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!resend || !from || recipients.length === 0) return false;

  const lines = [
    `Name: ${input.name || "(not given)"}`,
    `Email: ${input.email}`,
    `Company: ${input.company || "(not given)"}`,
    "",
    input.message || "(no message)",
  ];
  const { error } = await resend.emails.send(
    {
      from,
      to: recipients,
      replyTo: input.email,
      subject: `Sponsor lead from ${input.name || input.email}`,
      text: lines.join("\n"),
    },
    { idempotencyKey: `sponsor-lead/${input.id}` },
  );
  if (error) {
    await logError(error, "/api/sponsor", { id: input.id });
    return false;
  }
  return true;
}
