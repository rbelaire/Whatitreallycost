import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="font-serif text-4xl">That page isn’t in the ledger.</h1>
      <p className="mt-3 text-muted">The build, tool, or sponsor link doesn’t match anything we have.</p>
      <Link href="/" className="mt-6 inline-block font-medium text-pine underline">
        Back to the builds
      </Link>
    </main>
  );
}
