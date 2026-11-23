"use client";

import { useState } from "react";
import { APP_TYPES, TOOLS } from "@/lib/catalog";

export function SubmitForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  if (status === "done") {
    return (
      <p className="rounded-2xl border border-pine bg-pine-soft px-4 py-5 text-sm leading-relaxed" role="status">
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
        setMessage("");
        try {
          const response = await fetch("/api/submit", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(data),
          });
          const body = (await response.json()) as { error?: string; message?: string };
          if (!response.ok) {
            setStatus("error");
            setMessage(body.error || "Could not save that submission.");
            return;
          }
          setStatus("done");
          setMessage(body.message || "Saved for review. It will not go live until someone checks the source.");
        } catch {
          setStatus("error");
          setMessage("Could not save that submission.");
        }
      }}
    >
      <div className="absolute -left-[9999px] h-px overflow-hidden" aria-hidden="true">
        <label>
          Company website
          <input name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <Field label="What you built" name="title" required placeholder="A booking app for a yoga studio" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Choice label="Tool" name="tool" options={TOOLS.map((tool) => [tool.slug, tool.name])} />
        <Choice label="App type" name="appType" options={APP_TYPES.map((type) => [type.slug, type.name])} />
      </div>
      <label className="grid gap-1 text-sm font-medium">
        What it does
        <textarea
          name="description"
          rows={4}
          className="rounded-2xl border border-line bg-card px-3 py-2 text-base font-normal outline-none ring-pine focus:ring-2"
          placeholder="Only describe what you actually built."
        />
      </label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Credits" name="credits" type="number" placeholder="357" />
        <Field label="Tokens" name="tokens" type="number" placeholder="450000" />
        <Field label="Dollars" name="dollars" type="number" placeholder="140" />
        <Field label="Prompts" name="prompts" type="number" />
        <Field label="Days" name="days" type="number" />
        <label className="grid gap-1 text-sm font-medium">
          Shipped
          <select name="shipped" defaultValue="unsure" className="h-11 rounded-xl border border-line bg-card px-2 font-normal">
            <option value="unsure">Not stated</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
      </div>
      <Field label="Source link" name="sourceUrl" type="url" required placeholder="https://" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name (optional)" name="authorName" />
        <Field label="Email (optional, not published)" name="email" type="email" />
      </div>
      <p className="text-sm text-muted">
        Leave a field blank if you don’t know it. At least one of credits, tokens, or dollars is required. 0 is
        allowed when the build really cost nothing.
      </p>
      {message ? <p className="text-sm text-stamp">{message}</p> : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="h-12 rounded-full bg-ink px-6 text-sm font-semibold text-card disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : "Submit for review"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        min={type === "number" ? 0 : undefined}
        step="any"
        className="h-11 rounded-xl border border-line bg-card px-3 text-base font-normal outline-none ring-pine focus:ring-2"
      />
    </label>
  );
}

function Choice({ label, name, options }: { label: string; name: string; options: [string, string][] }) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      <select name={name} required className="h-11 rounded-xl border border-line bg-card px-2 font-normal" defaultValue="">
        <option value="" disabled>
          Choose
        </option>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
