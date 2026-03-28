"use client";

import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

function shortKey(key?: string) {
  if (!key) return "";
  return `${key.slice(0, 6)}…${key.slice(-4)}`;
}

export function TopBar() {
  const { user, signIn, signOut, isHydrated } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between gap-3 border-b border-border bg-bg/95 px-5 backdrop-blur">
      <input
        aria-label="Search"
        placeholder="Search DeSo"
        className="w-full max-w-[520px] rounded-full border border-border bg-panel px-4 py-2.5 text-sm outline-none placeholder:text-muted"
      />
      {!isHydrated ? (
        <div className="h-9 w-28 rounded-full border border-border bg-panel/60" />
      ) : user ? (
        <div className="flex items-center gap-2">
          {user.profilePic ? (
            <Image src={user.profilePic} alt={user.username || "profile"} width={40} height={40} unoptimized className="h-9 w-9 rounded-full border border-border object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-full border border-border bg-panel" />
          )}
          <div className="rounded-full border border-border bg-panel px-3 py-1.5 text-sm">
            {user.username ? `@${user.username}` : shortKey(user.publicKey)}
          </div>
          <button className="rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:bg-slate-900" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      ) : (
        <button className="rounded-full border border-border bg-panel px-4 py-2 text-sm font-medium hover:bg-slate-900" onClick={() => void signIn()}>
          Sign in with DeSo
        </button>
      )}
    </header>
  );
}
