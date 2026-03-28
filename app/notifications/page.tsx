"use client";

import { RightRail } from "@/components/right-rail";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { useAuth } from "@/hooks/useAuth";

export default function NotificationsPage() {
  const { user } = useAuth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px]">
      <Sidebar />
      <section className="min-w-0 flex-1 border-l border-r border-border xl:max-w-[760px]">
        <TopBar />
        <div className="space-y-4 px-5 py-4">
          <header className="card p-5">
            <h1 className="text-2xl font-semibold">Notifications</h1>
            <p className="mt-2 text-sm text-muted">
              This page is live now, with a clean MVP state instead of a dead link.
            </p>
          </header>

          {!user ? (
            <section className="card p-5 text-sm text-muted">
              Sign in with DeSo to view account-specific notifications when that feed is connected.
            </section>
          ) : (
            <section className="card p-5">
              <h2 className="text-lg font-semibold">You&apos;re signed in</h2>
              <p className="mt-2 text-sm text-muted">
                Notification ingestion is not wired yet, but this route is now functional and ready for the next backend pass.
              </p>
            </section>
          )}
        </div>
      </section>
      <RightRail />
    </main>
  );
}
