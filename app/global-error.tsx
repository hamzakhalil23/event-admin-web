"use client";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-stone-50">
          <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
            <p className="text-4xl">⚠️</p>
            <p className="mt-4 text-xl font-bold text-stone-900">Application error</p>
            <p className="mt-1 text-sm text-stone-500">
              {error.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={reset}
              className="mt-6 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
