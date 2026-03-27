"use client";

import { Composer } from "@/components/composer";
import { PostCard } from "@/components/post-card";
import { RightRail } from "@/components/right-rail";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { useFeed } from "@/hooks/useFeed";

export default function HomePage() {
  const feed = useFeed();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1400px] gap-4 px-2 md:px-4">
      <Sidebar />
      <section className="min-w-0 flex-1">
        <TopBar />
        <div className="card overflow-hidden">
          <Composer />
          {feed.isLoading && <p className="p-4 text-sm text-muted">Loading feed…</p>}
          {feed.isError && <p className="p-4 text-sm text-red-300">Failed to load feed.</p>}
          {feed.data?.map((post) => <PostCard key={post.PostHashHex} post={post} />)}
        </div>
      </section>
      <RightRail />
    </main>
  );
}
