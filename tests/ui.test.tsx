import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { Providers } from "@/components/providers";
import { Composer } from "@/components/composer";
import { PostCard } from "@/components/post-card";
import { Sidebar } from "@/components/sidebar";
import { TodayNewsCard } from "@/components/today-news-card";
import { TopicTabs } from "@/components/topic-tabs";
import { TopBar } from "@/components/topbar";

const topic = {
  slug: "phrase-focus",
  title: "Focus Trends on DeSo",
  updatedAtNanos: Date.now() * 1e6,
  summary: "Users are discussing focus",
  category: "Crypto" as const,
  postCount: 4,
  score: 20,
  postHashes: ["1"],
  topPostHashes: ["1"],
};

test("Buy DESO points to portview and no Blog Post button exists", () => {
  render(
    <Providers>
      <Sidebar />
    </Providers>,
  );
  const link = screen.getByRole("link", { name: "Buy DESO" });
  expect(link).toHaveAttribute("href", "https://portview.xyz");
  expect(screen.queryByText("Blog Post")).not.toBeInTheDocument();
});

test("sidebar routes all internal tabs to real pages", () => {
  window.localStorage.removeItem("desotrends-auth");

  render(
    <Providers>
      <Sidebar />
    </Providers>,
  );

  expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: "Notifications" })).toHaveAttribute("href", "/notifications");
  expect(screen.getByRole("link", { name: "Discover" })).toHaveAttribute("href", "/discover");
  expect(screen.getByRole("link", { name: "Messages" })).toHaveAttribute("href", "/messages");
  expect(screen.getByRole("link", { name: "My Wallet" })).toHaveAttribute("href", "/wallet");
  expect(screen.getByRole("link", { name: "More" })).toHaveAttribute("href", "/more");
});

test("My Profile routes to /me when logged out", () => {
  window.localStorage.removeItem("desotrends-auth");
  render(
    <Providers>
      <Sidebar />
    </Providers>,
  );
  expect(screen.getByRole("link", { name: "My Profile" })).toHaveAttribute("href", "/me");
});

test("topbar renders persisted fallback auth user as signed in", () => {
  window.localStorage.setItem(
    "desotrends-auth",
    JSON.stringify({
      publicKey: "BC1YLfallbackUser",
      profilePic: "https://node.deso.org/api/v0/get-single-profile-picture/BC1YLfallbackUser",
    }),
  );

  render(
    <Providers>
      <TopBar />
    </Providers>,
  );

  expect(screen.getByText("BC1YLf…User")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
});

test("composer keeps only image and video tools and only following hot core tabs", () => {
  render(
    <Providers>
      <Composer feedMode="hot" onFeedModeChange={vi.fn()} />
    </Providers>,
  );

  expect(screen.getByRole("button", { name: "Upload image" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Upload video" })).toBeInTheDocument();
  expect(screen.queryByTitle("Code")).not.toBeInTheDocument();
  expect(screen.queryByTitle("Chart")).not.toBeInTheDocument();
  expect(screen.queryByTitle("Link")).not.toBeInTheDocument();

  expect(screen.getByRole("button", { name: "Following" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Hot" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Core" })).toBeInTheDocument();
  expect(screen.queryByText("New")).not.toBeInTheDocument();
  expect(screen.queryByText("# Explore")).not.toBeInTheDocument();
});

test("verified badge appears on allowlisted core account posts", () => {
  const post = {
    PostHashHex: "core-post",
    Body: "core team update",
    TimestampNanos: Date.now() * 1e6,
    PosterPublicKeyBase58Check: "pk-core",
    ProfileEntryResponse: { Username: "deso" },
  };

  render(<PostCard post={post} />);
  expect(screen.getByLabelText("Verified core team account")).toBeInTheDocument();
});

test("verified badge does not appear on non-core account posts", () => {
  const post = {
    PostHashHex: "random-post",
    Body: "random update",
    TimestampNanos: Date.now() * 1e6,
    PosterPublicKeyBase58Check: "pk-random",
    ProfileEntryResponse: { Username: "randomuser" },
  };

  render(<PostCard post={post} />);
  expect(screen.queryByLabelText("Verified core team account")).not.toBeInTheDocument();
});

test("Today's News module renders", () => {
  render(<TodayNewsCard topics={[topic]} />);
  expect(screen.getByText("Today's News")).toBeInTheDocument();
  expect(screen.getByText("Focus Trends on DeSo")).toBeInTheDocument();
});

test("Top and Latest tabs switch", async () => {
  const topPost = { PostHashHex: "1", Body: "top", TimestampNanos: 1, PosterPublicKeyBase58Check: "pk1" };
  const latestPost = { PostHashHex: "2", Body: "latest", TimestampNanos: 2, PosterPublicKeyBase58Check: "pk2" };
  render(<TopicTabs topPosts={[topPost]} latestPosts={[latestPost]} />);
  expect(screen.getByText("top")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Latest" }));
  expect(await screen.findByText("latest")).toBeInTheDocument();
});
