"use client";

import { BarChart3, Code2, ImageIcon, Link2, Video } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCreatePost } from "@/hooks/useFeed";

const tools = [
  { label: "Code", icon: Code2 },
  { label: "Video", icon: Video },
  { label: "Image", icon: ImageIcon },
  { label: "Chart", icon: BarChart3 },
  { label: "Link", icon: Link2 },
] as const;

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
    <section className="border-b border-border">
      <div className="flex gap-3 px-5 py-4">
        <div className="pt-1">
          {user?.profilePic ? (
            <Image src={user.profilePic} alt={user.username || "profile"} width={40} height={40} unoptimized className="h-10 w-10 rounded-full border border-border object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-full border border-border bg-panel" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's happening on DeSo?"
            className="min-h-24 w-full resize-y rounded-xl border border-border bg-panel p-3 text-sm outline-none"
          />
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-1">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.label}
                    type="button"
                    title={tool.label}
                    className="rounded-md p-2 text-muted transition hover:bg-slate-900 hover:text-slate-200"
                  >
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => void onSubmit()}
              disabled={mutation.isPending || !text.trim()}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {user ? "Post" : "Sign in to post"}
            </button>
          </div>
          <div className="mt-2 text-xs text-red-300">
            {mutation.isError ? "Failed to publish. Try again." : mutation.isSuccess ? "Posted successfully." : ""}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6 border-t border-border px-5 py-2 text-sm">
        <span className="text-muted">Following</span>
        <span className="font-medium text-slate-100">Hot</span>
        <span className="text-muted">New</span>
        <span className="text-muted"># Explore</span>
      </div>
    </section>
  );
}
