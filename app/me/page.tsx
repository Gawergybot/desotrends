"use client";

import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { RightRail } from "@/components/right-rail";
import { useAuth } from "@/hooks/useAuth";

export default function MePage() {
  const { user } = useAuth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1400px] gap-4 px-2 md:px-4">
      <Sidebar />
      <section className="min-w-0 flex-1">
        <TopBar />
        <article className="card p-4">
          <Link href="/" className="text-sm text-accent">← Back</Link>
          {!user && (
            <p className="mt-4 text-sm text-muted">Sign in with DeSo to open your profile.</p>
          )}
          {user && !user.username && (
            <p className="mt-4 text-sm text-muted">Profile username is not available for this account yet.</p>
          )}
          {user?.username && (
            <Link className="mt-4 inline-block rounded-lg border border-border px-3 py-2 text-sm" href={`/profile/${user.username}`}>
              Open @{user.username}
            </Link>
          )}
        </article>
      </section>
      <RightRail />
    </main>
  );
}
