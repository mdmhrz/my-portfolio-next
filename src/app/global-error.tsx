'use client'; // Error boundaries must be Client Components

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    // global-error replaces the root layout on error, so it must define its own html/body
    <html lang="en">
      <body className="antialiased font-sans">
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
          <h1 className="text-2xl font-medium tracking-tight">Something went wrong</h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            The site is temporarily unavailable. Please try again in a moment.
          </p>
          <button
            onClick={() => reset()}
            className="mt-8 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
