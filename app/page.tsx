import LoginForm from "./login-form";

// Server component — no "use client" needed here
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 p-6">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <span className="inline-block rounded-2xl bg-emerald-900 px-5 py-2 text-xs font-extrabold uppercase tracking-widest text-emerald-100">
            Ijtima
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-stone-900">Admin Panel</h1>
          <p className="mt-2 text-stone-500">Sign in to manage event content</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
