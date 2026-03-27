"use client";

import { useState } from "react";
import { DeSoPost } from "@/lib/types";
import { PostCard } from "@/components/post-card";

export function TopicTabs({ topPosts, latestPosts }: { topPosts: DeSoPost[]; latestPosts: DeSoPost[] }) {
  const [tab, setTab] = useState<"Top" | "Latest">("Top");
  const items = tab === "Top" ? topPosts : latestPosts;

  return (
    <div>
      <div className="mb-3 flex border-b border-border">
        {["Top", "Latest"].map((item) => (
          <button
            key={item}
            onClick={() => setTab(item as "Top" | "Latest")}
            className={`px-4 py-2 text-sm ${tab === item ? "border-b-2 border-accent text-white" : "text-muted"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-border">
        {items.map((post) => <PostCard key={post.PostHashHex} post={post} />)}
        {!items.length && <p className="p-4 text-sm text-muted">No posts available.</p>}
      </div>
    </div>
  );
}
