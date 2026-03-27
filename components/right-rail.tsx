"use client";

import { TodayNewsCard } from "@/components/today-news-card";
import { useTrendingTopics } from "@/hooks/useTrending";

export function RightRail() {
  const { topics, isLoading, isError } = useTrendingTopics();

  return (
    <aside className="hidden w-80 xl:block">
      <div className="sticky top-20 space-y-4">
        <section className="card p-4 text-sm text-muted">Trending stories derived deterministically from DeSo posts.</section>
        {isLoading && <section className="card p-4 text-sm text-muted">Loading trends…</section>}
        {isError && <section className="card p-4 text-sm text-red-300">Failed to load trends.</section>}
        {!isLoading && !isError && <TodayNewsCard topics={topics} />}
      </div>
    </aside>
  );
}
