"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/post-card";
import { RightRail } from "@/components/right-rail";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { VerifiedBadge } from "@/components/verified-badge";
import { useAuth } from "@/hooks/useAuth";
import { isCoreUsername } from "@/lib/core-accounts";
import { getPostsForPublicKey, getProfile, getProfileByPublicKey } from "@/lib/deso";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { user } = useAuth();
  const isMeAlias = username.toLowerCase() === "me";
  const resolvedUsername = isMeAlias ? user?.username : username;

  const profile = useQuery({
    queryKey: ["profile", resolvedUsername, user?.publicKey],
    queryFn: () => {
      if (resolvedUsername) return getProfile(resolvedUsername);
      if (isMeAlias && user?.publicKey) return getProfileByPublicKey(user.publicKey);
      throw new Error("No profile target available");
    },
    enabled: Boolean(resolvedUsername || (isMeAlias && user?.publicKey)),
  });

  const publicKey = profile.data?.Profile?.PublicKeyBase58Check;

  const posts = useQuery({
    queryKey: ["profilePosts", publicKey],
    queryFn: () => getPostsForPublicKey(publicKey!),
    enabled: Boolean(publicKey),
  });

  const headerUsername = profile.data?.Profile?.Username || username;
  const showVerified = isCoreUsername(headerUsername);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px]">
      <Sidebar />
      <section className="min-w-0 flex-1 border-l border-r border-border xl:max-w-[760px]">
        <TopBar />
        <article>
          <div className="px-5 py-4">
            <Link href="/" className="text-sm text-accent">
              ← Back
            </Link>
            {isMeAlias && !user && <p className="mt-4 text-sm text-muted">Sign in with DeSo to view your profile.</p>}
            {profile.isLoading && <p className="mt-4 text-sm text-muted">Loading profile…</p>}
            {profile.data?.Profile && (
              <header className="mt-4 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold">@{headerUsername}</h1>
                  {showVerified ? <VerifiedBadge size={18} /> : null}
                </div>
                <p className="mt-2 text-sm text-muted">{profile.data.Profile.Description || "No bio available."}</p>
              </header>
            )}
            {profile.isError && <p className="mt-4 text-sm text-red-300">Failed to load profile.</p>}
          </div>
          <section>
            {posts.data?.map((post) => <PostCard key={post.PostHashHex} post={post} />)}
            {posts.isLoading && <p className="p-4 text-sm text-muted">Loading posts…</p>}
            {posts.isError && <p className="p-4 text-sm text-red-300">Failed to load posts.</p>}
          </section>
        </article>
      </section>
      <RightRail />
    </main>
  );
}
