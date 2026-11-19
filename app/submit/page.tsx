import type { Metadata } from "next";
import { SubmitForm } from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "Submit a build",
  description: "Add a real AI-build cost. It goes into a review queue and is not published until the source checks out.",
};

export default function SubmitPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="font-serif text-4xl">Submit a build</h1>
      <p className="mt-3 text-muted">
        This is for a specific thing you (or someone else) built, with a public source that states the credits,
        tokens, or dollars. It waits in a review queue. It does not go live on its own.
      </p>
      <div className="mt-6">
        <SubmitForm />
      </div>
    </main>
  );
}
