import Link from "next/link";
import { DeSoPost } from "@/lib/types";

export function PostCard({ post }: { post: DeSoPost }) {
  const username = post.ProfileEntryResponse?.Username || `${post.PosterPublicKeyBase58Check.slice(0, 8)}...`;
  return (
    <article className="border-b border-border px-4 py-4">
      <div className="mb-1 text-sm font-semibold">
        <Link href={`/profile/${username}`} className="hover:underline">@{username}</Link>
      </div>
      <p className="whitespace-pre-wrap text-sm text-slate-100">{post.Body || "(No text body)"}</p>
    </article>
  );
}
