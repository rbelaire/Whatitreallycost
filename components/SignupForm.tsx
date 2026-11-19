"use client";

import { useState } from "react";

export function SignupForm({
  source,
  compact = false,
  tone = "light",
}: {
  source: string;
  compact?: boolean;
  tone?: "light" | "dark";
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  return (
    <form
      className={`relative ${compact ? "flex flex-col gap-2 sm:flex-row" : "flex flex-col gap-3"}`}
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        setStatus("loading");
        setMessage("");
        try {
          const response = await fetch("/api/signup", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              email: data.get("email"),
              source,
              company_website: data.get("company_website"),
            }),
          });
          const body = (await response.json()) as { error?: string; message?: string };
          if (!response.ok) {
            setStatus("error");
            setMessage(body.error || "Could not save that email.");
            return;
          }
          setStatus("done");
          setMessage(body.message || "You’re on the list. Tuesday issue, five builds.");
          form.reset();
        } catch {
          setStatus("error");
          setMessage("Could not save that email.");
        }
      }}
    >
      <div className="absolute -left-[9999px] h-px overflow-hidden" aria-hidden="true">
        <label>
          Company website
          <input name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className={compact ? "sr-only" : "text-sm font-medium"} htmlFor={`email-${source}`}>
        Email
      </label>
      <div className={compact ? "flex flex-1 flex-col gap-2 sm:flex-row" : "flex flex-col gap-2 sm:flex-row"}>
        <input
          id={`email-${source}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@domain.com"
          className={`h-11 w-full rounded-full border px-4 text-base outline-none ring-pine focus:ring-2 ${
            tone === "dark" ? "border-white/20 bg-white text-ink" : "border-line bg-card"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="h-11 shrink-0 rounded-full bg-pine px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {status === "loading" ? "Saving…" : "Get Tuesday’s 5"}
        </button>
      </div>
      {message ? (
        <p className={status === "error" ? "text-sm text-stamp" : "text-sm text-pine"} role="status">
          {message}
        </p>
      ) : (
        <p className={tone === "dark" ? "text-sm text-card/75" : "text-sm text-muted"}>
          One short email. Costs people actually posted. Unsubscribe any time.
        </p>
      )}
    </form>
  );
}
