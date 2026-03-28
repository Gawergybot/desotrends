"use client";

import { TodayNewsCard } from "@/components/today-news-card";
import { useTrendingTopics } from "@/hooks/useTrending";

export function RightRail() {
  const { topics, isLoading, isError } = useTrendingTopics();

  return (
    <aside className="hidden w-[360px] shrink-0 border-l border-border xl:block">
      <div className="sticky top-0 space-y-4 px-5 py-4">
        {isLoading && <section className="card p-5 text-sm text-muted">Loading trends…</section>}
        {isError && <section className="card p-5 text-sm text-red-300">Failed to load trends.</section>}
        {!isLoading && !isError && <TodayNewsCard topics={topics} />}
      </div>
    </aside>
  );
}
