"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-serif text-4xl">Something broke while loading this page.</h1>
      <p className="mt-3 text-muted">The rest of the site should still be there. Try it again.</p>
      <button type="button" onClick={reset} className="mt-6 h-11 rounded-full bg-ink px-5 text-sm font-semibold text-card">
        Try again
      </button>
    </main>
  );
}
