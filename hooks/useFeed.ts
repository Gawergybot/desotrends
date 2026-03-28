"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGlobalFeed, getTrendingPostPool, submitPost } from "@/lib/deso";
import { filterCorePosts } from "@/lib/core-accounts";
import { signTransaction, submitSignedTransaction } from "@/lib/identity";

export type FeedMode = "following" | "hot" | "core";

async function getFeedForMode(mode: FeedMode) {
  if (mode === "following") {
    return [];
  }

  if (mode === "core") {
    const pool = await getTrendingPostPool();
    return filterCorePosts(pool).slice(0, 50);
  }

  return getGlobalFeed(50);
}

export function useFeed(mode: FeedMode = "hot") {
  return useQuery({
    queryKey: ["feed", mode],
    queryFn: () => getFeedForMode(mode),
    staleTime: mode === "hot" ? 30_000 : 60_000,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ publicKey, body }: { publicKey: string; body: string }) =>
      submitPost(publicKey, body, signTransaction, submitSignedTransaction),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}
