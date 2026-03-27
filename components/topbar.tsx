"use client";

import { useAuth } from "@/hooks/useAuth";

export function TopBar() {
  const { user, signIn, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-20 mb-4 flex items-center gap-3 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur">
      <input
        aria-label="Search"
        placeholder="Search DeSo"
        className="w-full rounded-full border border-border bg-panel px-4 py-2 text-sm outline-none"
      />
      {user ? (
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full border border-border px-3 py-1">{user.publicKey.slice(0, 8)}…</span>
          <button className="rounded-full border border-border px-3 py-1" onClick={signOut}>Sign out</button>
        </div>
      ) : (
        <button className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950" onClick={() => void signIn()}>
          Sign in with DeSo
        </button>
      )}
    </header>
  );
}
