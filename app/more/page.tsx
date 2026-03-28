"use client";

import { RightRail } from "@/components/right-rail";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { useAuth } from "@/hooks/useAuth";

export default function MorePage() {
  const { user } = useAuth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px]">
      <Sidebar />
      <section className="min-w-0 flex-1 border-l border-r border-border xl:max-w-[760px]">
        <TopBar />
        <div className="space-y-4 px-5 py-4">
          <header className="card p-5">
            <h1 className="text-2xl font-semibold">More</h1>
            <p className="mt-2 text-sm text-muted">
              Extra app context, account status, and space for future settings.
            </p>
          </header>

          <section className="card p-5">
            <h2 className="text-lg font-semibold">About DeSoTrends</h2>
            <p className="mt-2 text-sm text-muted">
              DeSoTrends turns recent DeSo posts into a cleaner, more readable trend surface with topic pages and summaries.
            </p>
          </section>

          <section className="card p-5">
            <h2 className="text-lg font-semibold">Account status</h2>
            <p className="mt-2 text-sm text-muted">
              {user ? `Signed in${user.username ? ` as @${user.username}` : " with a DeSo account"}.` : "Currently signed out."}
            </p>
          </section>
        </div>
      </section>
      <RightRail />
    </main>
  );
}
