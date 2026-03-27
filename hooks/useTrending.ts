"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPostsByHashes, getTrendingPostPool } from "@/lib/deso";
import { buildTrendingTopics } from "@/lib/trending";

export function useTrendingSourcePosts() {
  return useQuery({
    queryKey: ["trending-source-posts"],
    queryFn: getTrendingPostPool,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}

export function useTrendingTopics() {
  const postsQuery = useTrendingSourcePosts();
  const topics = useMemo(() => buildTrendingTopics(postsQuery.data ?? []), [postsQuery.data]);
  return {
    ...postsQuery,
    topics,
  };
}

export function useTopicPosts(postHashes: string[] | undefined) {
  return useQuery({
    queryKey: ["topic-posts", postHashes],
    queryFn: () => getPostsByHashes(postHashes ?? []),
    enabled: Boolean(postHashes?.length),
    staleTime: 60_000,
  });
}
