'use client'; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <h1 className="text-2xl font-medium tracking-tight">Something went wrong</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        We&apos;re having trouble loading this page right now. Please try again in a moment.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
