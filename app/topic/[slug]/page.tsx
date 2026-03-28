"use client";

import Link from "next/link";
import { use } from "react";
import { RightRail } from "@/components/right-rail";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { TopicTabs } from "@/components/topic-tabs";
import { useTopicPosts, useTrendingTopics } from "@/hooks/useTrending";
import { formatRelativeHours } from "@/lib/text";

export default function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const trending = useTrendingTopics();
  const topic = trending.topics.find((t) => t.slug === slug);
  const topicPosts = useTopicPosts(topic?.postHashes);

  const latestPosts = (topicPosts.data ?? []).sort((a, b) => b.TimestampNanos - a.TimestampNanos);
  const topPosts = latestPosts.filter((post) => topic?.topPostHashes.includes(post.PostHashHex));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px]">
      <Sidebar />
      <section className="min-w-0 flex-1 border-l border-r border-border xl:max-w-[760px]">
        <TopBar />
        {trending.isLoading && <div className="p-4 text-sm text-muted">Loading topic…</div>}
        {!trending.isLoading && !topic ? (
          <div className="px-5 py-4">
            <Link href="/" className="text-sm text-accent">
              ← Back
            </Link>
            <p className="mt-3 text-sm text-muted">Topic not found in the current canonical trend window.</p>
          </div>
        ) : topic ? (
          <article className="px-5 py-4">
            <Link href="/" className="text-sm text-accent">
              ← Back
            </Link>
            <h1 className="mt-3 text-2xl font-bold">{topic.title}</h1>
            <p className="mt-1 text-sm text-muted">Last updated {formatRelativeHours(topic.updatedAtNanos)}</p>
            <div className="mt-4 whitespace-pre-line text-sm text-slate-100">{topic.summary}</div>
            <p className="mt-3 text-xs text-muted">This story is a summary of posts on DeSo and may evolve over time.</p>
            <div className="mt-6">
              <TopicTabs topPosts={topPosts} latestPosts={latestPosts} />
            </div>
          </article>
        ) : null}
      </section>
      <RightRail />
    </main>
  );
}
