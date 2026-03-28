import Link from "next/link";
import { TrendingTopic } from "@/lib/types";
import { formatRelativeHours } from "@/lib/text";

export function TodayNewsCard({ topics }: { topics: TrendingTopic[] }) {
  return (
    <section className="card p-5" aria-label="Today's News">
      <h2 className="mb-3 text-lg font-semibold">Today&apos;s News</h2>
      <div className="space-y-1.5">
        {topics.map((topic) => (
          <Link key={topic.slug} href={`/topic/${topic.slug}`} className="block rounded-lg px-3 py-2.5 transition hover:bg-slate-900">
            <div className="line-clamp-2 text-sm font-semibold leading-5">{topic.title}</div>
            <div className="mt-1 text-xs text-muted">
              {topic.category} · {formatRelativeHours(topic.updatedAtNanos)} · {topic.postCount} posts
            </div>
          </Link>
        ))}
        {!topics.length && <p className="text-sm text-muted">No trends found in the last 24 hours.</p>}
      </div>
    </section>
  );
}
