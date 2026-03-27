"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getGlobalFeed, submitPost } from "@/lib/deso";
import { signTransaction, submitSignedTransaction } from "@/lib/identity";

export function useFeed() {
  return useQuery({
    queryKey: ["feed"],
    queryFn: () => getGlobalFeed(50),
    staleTime: 30_000,
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
