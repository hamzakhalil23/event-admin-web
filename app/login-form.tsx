"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, null);

  return (
    <form action={action}>
      <input
        className="mb-4 w-full rounded-xl border border-stone-200 bg-stone-100 p-4 text-stone-900 placeholder-stone-400 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
        placeholder="Admin email"
        type="email"
        name="email"
        required
        autoComplete="email"
      />

      <input
        className="mb-6 w-full rounded-xl border border-stone-200 bg-stone-100 p-4 text-stone-900 placeholder-stone-400 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
        placeholder="Password"
        type="password"
        name="password"
        required
        autoComplete="current-password"
      />

      {state?.success === false && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-emerald-900 p-4 font-extrabold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
