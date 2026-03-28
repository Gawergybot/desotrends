"use client";

import Link from "next/link";
import { RightRail } from "@/components/right-rail";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { useTrendingTopics } from "@/hooks/useTrending";
import { formatRelativeHours } from "@/lib/text";

export default function DiscoverPage() {
  const { topics, isLoading, isError } = useTrendingTopics();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px]">
      <Sidebar />
      <section className="min-w-0 flex-1 border-l border-r border-border xl:max-w-[760px]">
        <TopBar />
        <div className="space-y-4 px-5 py-4">
          <header className="card p-5">
            <h1 className="text-2xl font-semibold">Discover</h1>
            <p className="mt-2 text-sm text-muted">
              Higher-signal DeSo topics ranked by author diversity, post volume, recency burst, and spam filtering.
            </p>
          </header>

          {isLoading ? <section className="card p-5 text-sm text-muted">Loading trends…</section> : null}
          {isError ? <section className="card p-5 text-sm text-red-300">Failed to load trends.</section> : null}

          {!isLoading && !isError
            ? topics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/topic/${topic.slug}`}
                  className="card block p-5 transition hover:bg-slate-950/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">{topic.title}</h2>
                      <p className="mt-1 text-xs text-muted">
                        {topic.category} · {formatRelativeHours(topic.updatedAtNanos)} · {topic.postCount} posts
                      </p>
                    </div>
                    <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">
                      score {topic.score}
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-100">{topic.summary}</p>
                </Link>
              ))
            : null}

          {!isLoading && !isError && !topics.length ? (
            <section className="card p-5 text-sm text-muted">No strong trends were found in the current window.</section>
          ) : null}
        </div>
      </section>
      <RightRail />
    </main>
  );
}
