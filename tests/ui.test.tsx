import { render, screen } from "@testing-library/react";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/sidebar";
import { TodayNewsCard } from "@/components/today-news-card";
import { TopicTabs } from "@/components/topic-tabs";

const topic = {
  slug: "focus",
  title: "Focus Sparks Discussion",
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

test("My Profile routes to /me when logged out", () => {
  window.localStorage.removeItem("desotrends-auth");
  render(
    <Providers>
      <Sidebar />
    </Providers>,
  );
  expect(screen.getByRole("link", { name: "My Profile" })).toHaveAttribute("href", "/me");
});

test("Today's News module renders", () => {
  render(<TodayNewsCard topics={[topic]} />);
  expect(screen.getByText("Today's News")).toBeInTheDocument();
  expect(screen.getByText("Focus Sparks Discussion")).toBeInTheDocument();
});

test("Top and Latest tabs switch", async () => {
  const topPost = { PostHashHex: "1", Body: "top", TimestampNanos: 1, PosterPublicKeyBase58Check: "pk1" };
  const latestPost = { PostHashHex: "2", Body: "latest", TimestampNanos: 2, PosterPublicKeyBase58Check: "pk2" };
  render(<TopicTabs topPosts={[topPost]} latestPosts={[latestPost]} />);
  expect(screen.getByText("top")).toBeInTheDocument();
  screen.getByRole("button", { name: "Latest" }).click();
  expect(screen.getByText("latest")).toBeInTheDocument();
});
