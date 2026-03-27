"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCreatePost } from "@/hooks/useFeed";

export function Composer() {
  const [text, setText] = useState("");
  const { user, signIn } = useAuth();
  const mutation = useCreatePost();

  const onSubmit = async () => {
    if (!text.trim()) return;
    if (!user) {
      await signIn();
      return;
    }
    await mutation.mutateAsync({ publicKey: user.publicKey, body: text.trim() });
    setText("");
  };

  return (
    <section className="border-b border-border p-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's happening on DeSo?"
        className="min-h-24 w-full resize-y rounded-xl border border-border bg-panel p-3 text-sm outline-none"
      />
      <div className="mt-3 flex items-center justify-between text-xs text-red-300">
        <span>{mutation.isError ? "Failed to publish. Try again." : mutation.isSuccess ? "Posted successfully." : ""}</span>
        <button
          onClick={() => void onSubmit()}
          disabled={mutation.isPending || !text.trim()}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {user ? "Post" : "Sign in to post"}
        </button>
      </div>
    </section>
  );
}
