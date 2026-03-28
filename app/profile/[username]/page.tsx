"use client";

import Link from "next/link";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/post-card";
import { RightRail } from "@/components/right-rail";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { useAuth } from "@/hooks/useAuth";
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1400px] gap-4 px-2 md:px-4">
      <Sidebar />
      <section className="min-w-0 flex-1">
        <TopBar />
        <article className="card p-4">
          <Link href="/" className="text-sm text-accent">← Back</Link>
          {isMeAlias && !user && <p className="mt-4 text-sm text-muted">Sign in with DeSo to view your profile.</p>}
          {profile.isLoading && <p className="mt-4 text-sm text-muted">Loading profile…</p>}
          {profile.data?.Profile && (
            <header className="mt-4 border-b border-border pb-4">
              <h1 className="text-2xl font-semibold">@{profile.data.Profile.Username || username}</h1>
              <p className="mt-2 text-sm text-muted">{profile.data.Profile.Description || "No bio available."}</p>
            </header>
          )}
          {profile.isError && <p className="mt-4 text-sm text-red-300">Failed to load profile.</p>}
          <section className="mt-4 rounded-xl border border-border">
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
