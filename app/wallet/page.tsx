"use client";

import Link from "next/link";
import { RightRail } from "@/components/right-rail";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { useAuth } from "@/hooks/useAuth";

export default function WalletPage() {
  const { user } = useAuth();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px]">
      <Sidebar />
      <section className="min-w-0 flex-1 border-l border-r border-border xl:max-w-[760px]">
        <TopBar />
        <div className="space-y-4 px-5 py-4">
          <header className="card p-5">
            <h1 className="text-2xl font-semibold">My Wallet</h1>
            <p className="mt-2 text-sm text-muted">
              Quick identity and wallet surface for DeSo users.
            </p>
          </header>

          {!user ? (
            <section className="card p-5 text-sm text-muted">
              Sign in with DeSo to view your public key and wallet-related shortcuts.
            </section>
          ) : (
            <>
              <section className="card p-5">
                <h2 className="text-lg font-semibold">{user.username ? `@${user.username}` : "Signed-in account"}</h2>
                <p className="mt-3 text-xs uppercase tracking-wide text-muted">Public key</p>
                <div className="mt-2 rounded-xl border border-border bg-slate-950/40 p-3 text-sm break-all">
                  {user.publicKey}
                </div>
              </section>

              <section className="card p-5">
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={user.username ? `/profile/${user.username}` : "/me"}
                    className="rounded-full border border-border px-4 py-2 text-sm hover:bg-slate-900"
                  >
                    Open profile
                  </Link>
                  <a
                    href="https://portview.xyz"
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-border px-4 py-2 text-sm hover:bg-slate-900"
                  >
                    Buy DESO
                  </a>
                </div>
              </section>
            </>
          )}
        </div>
      </section>
      <RightRail />
    </main>
  );
}
