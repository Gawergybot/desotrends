"use client";

import { RightRail } from "@/components/right-rail";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { useAuth } from "@/hooks/useAuth";

export default function MessagesPage() {
  const { user } = useAuth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px]">
      <Sidebar />
      <section className="min-w-0 flex-1 border-l border-r border-border xl:max-w-[760px]">
        <TopBar />
        <div className="space-y-4 px-5 py-4">
          <header className="card p-5">
            <h1 className="text-2xl font-semibold">Messages</h1>
            <p className="mt-2 text-sm text-muted">
              This route now exists and shows a real state instead of a stub.
            </p>
          </header>

          {!user ? (
            <section className="card p-5 text-sm text-muted">
              Sign in with DeSo to prepare for direct messaging once message APIs are connected.
            </section>
          ) : (
            <section className="card p-5">
              <h2 className="text-lg font-semibold">Inbox coming next</h2>
              <p className="mt-2 text-sm text-muted">
                Your DeSo account is recognized. Messaging UI can now be extended here without changing navigation again.
              </p>
            </section>
          )}
        </div>
      </section>
      <RightRail />
    </main>
  );
}
