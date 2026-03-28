import Image from "next/image";
import { Diamond, Heart, MessageCircle, Repeat2, Share2 } from "@/components/icons";
import Link from "next/link";
import { VerifiedBadge } from "@/components/verified-badge";
import { formatRelativeHours } from "@/lib/text";
import { isCoreUsername } from "@/lib/core-accounts";
import { profilePicUrl } from "@/lib/deso";
import { DeSoPost } from "@/lib/types";

export function PostCard({ post }: { post: DeSoPost }) {
  const profileUsername = post.ProfileEntryResponse?.Username;
  const username = profileUsername || `${post.PosterPublicKeyBase58Check.slice(0, 8)}...`;
  const showVerified = isCoreUsername(profileUsername);
  const avatarUrl = profilePicUrl(post.PosterPublicKeyBase58Check);

  return (
    <article className="border-b border-border px-5 py-4">
      <div className="flex gap-3">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={profileUsername || "profile"}
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full border border-border bg-panel" />
        )}

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2 text-sm">
            <Link href={`/profile/${username}`} className="font-semibold hover:underline">
              @{username}
            </Link>
            {showVerified ? <VerifiedBadge size={16} className="mt-[1px]" /> : null}
            <span className="text-muted">·</span>
            <span className="text-xs text-muted">{formatRelativeHours(post.TimestampNanos)}</span>
          </div>

          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-100">{post.Body || "(No text body)"}</p>

          <div className="mt-3 flex items-center justify-between pr-8 text-muted">
            <button className="inline-flex items-center gap-1 text-xs hover:text-slate-200">
              <MessageCircle size={16} />
              <span>0</span>
            </button>
            <button className="inline-flex items-center gap-1 text-xs hover:text-slate-200">
              <Repeat2 size={16} />
              <span>0</span>
            </button>
            <button className="inline-flex items-center gap-1 text-xs hover:text-slate-200">
              <Heart size={16} />
              <span>0</span>
            </button>
            <button className="inline-flex items-center gap-1 text-xs hover:text-slate-200">
              <Diamond size={16} />
              <span>0</span>
            </button>
            <button className="inline-flex items-center gap-1 text-xs hover:text-slate-200">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
