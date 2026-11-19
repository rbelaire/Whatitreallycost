"use client";

import { useState } from "react";

export function SponsorForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  if (status === "done") {
    return (
      <p className="rounded-2xl border border-pine bg-pine-soft px-4 py-5 text-sm" role="status">
        {message}
      </p>
    );
  }

  return (
    <form
      className="relative grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = Object.fromEntries(new FormData(form).entries());
        setStatus("loading");
        try {
          const response = await fetch("/api/sponsor", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(data),
          });
          const body = (await response.json()) as { error?: string; message?: string };
          if (!response.ok) {
            setStatus("error");
            setMessage(body.error || "Could not send that.");
            return;
          }
          setStatus("done");
          setMessage(body.message || "Got it. We’ll reply by email.");
        } catch {
          setStatus("error");
          setMessage("Could not send that.");
        }
      }}
    >
      <div className="absolute -left-[9999px] h-px overflow-hidden" aria-hidden="true">
        <label>
          Company website
          <input name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-medium">
        Name
        <input name="name" required className="h-11 rounded-xl border border-line bg-card px-3 font-normal" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Email
        <input name="email" type="email" required className="h-11 rounded-xl border border-line bg-card px-3 font-normal" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Company
        <input name="company" className="h-11 rounded-xl border border-line bg-card px-3 font-normal" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        What you want to sponsor
        <textarea name="message" rows={4} className="rounded-2xl border border-line bg-card px-3 py-2 font-normal" />
      </label>
      {message ? <p className="text-sm text-stamp">{message}</p> : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="h-12 rounded-full bg-ink text-sm font-semibold text-card disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Get in touch"}
      </button>
    </form>
  );
}
