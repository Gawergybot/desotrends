"use client";

import { useState } from "react";
import { Composer } from "@/components/composer";
import { PostCard } from "@/components/post-card";
import { RightRail } from "@/components/right-rail";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { type FeedMode, useFeed } from "@/hooks/useFeed";

function emptyMessageForMode(mode: FeedMode) {
  if (mode === "following") {
    return "Following feed is not wired yet. Switch to Hot or Core.";
  }

  if (mode === "core") {
    return "No core-team or official DeSo posts were found in the current feed window.";
  }

  return "No posts found.";
}

export default function HomePage() {
  const [feedMode, setFeedMode] = useState<FeedMode>("hot");
  const feed = useFeed(feedMode);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px]">
      <Sidebar />
      <section className="min-w-0 flex-1 border-l border-r border-border xl:max-w-[760px]">
        <TopBar />
        <div className="overflow-hidden">
          <Composer feedMode={feedMode} onFeedModeChange={setFeedMode} />
          {feed.isLoading && <p className="p-4 text-sm text-muted">Loading feed…</p>}
          {feed.isError && <p className="p-4 text-sm text-red-300">Failed to load feed.</p>}
          {!feed.isLoading && !feed.isError && !(feed.data?.length) ? (
            <p className="p-4 text-sm text-muted">{emptyMessageForMode(feedMode)}</p>
          ) : null}
          {feed.data?.map((post) => <PostCard key={post.PostHashHex} post={post} />)}
        </div>
      </section>
      <RightRail />
    </main>
  );
}
