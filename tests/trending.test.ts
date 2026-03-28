import { buildTrendingTopics, findTopicBySlug } from "@/lib/trending";

const baseNanos = Date.now() * 1e6;

const posts = [
  { PostHashHex: "a", Body: "#openfund builders are comparing grant updates today", TimestampNanos: baseNanos, PosterPublicKeyBase58Check: "pk1" },
  { PostHashHex: "b", Body: "#openfund community is discussing new application criteria", TimestampNanos: baseNanos - 1e9, PosterPublicKeyBase58Check: "pk2" },
  { PostHashHex: "c", Body: "#openfund contributors want more transparent funding milestones", TimestampNanos: baseNanos - 2e9, PosterPublicKeyBase58Check: "pk3" },
  { PostHashHex: "d", Body: "#openfund creators are sharing project outcomes", TimestampNanos: baseNanos - 3e9, PosterPublicKeyBase58Check: "pk4" },
  { PostHashHex: "e", Body: "mint now join now season 1 rewards at nftz.me", TimestampNanos: baseNanos - 1e9, PosterPublicKeyBase58Check: "spam1" },
  { PostHashHex: "f", Body: "mint now join now season 1 rewards at nftz.me", TimestampNanos: baseNanos - 2e9, PosterPublicKeyBase58Check: "spam2" },
  { PostHashHex: "g", Body: "mint now join now season 1 rewards at nftz.me", TimestampNanos: baseNanos - 3e9, PosterPublicKeyBase58Check: "spam3" },
];

test("clusters topics deterministically", () => {
  const first = buildTrendingTopics(posts as never, 5);
  const second = buildTrendingTopics(posts as never, 5);
  expect(first.map((t) => t.slug)).toEqual(second.map((t) => t.slug));
});

test("promotional spam is filtered out", () => {
  const topics = buildTrendingTopics(posts as never, 5);
  expect(topics.some((t) => t.summary.toLowerCase().includes("nftz.me"))).toBe(false);
  expect(topics.some((t) => t.slug.includes("openfund"))).toBe(true);
});

test("summary generation is deterministic", () => {
  const topics = buildTrendingTopics(posts as never, 5);
  const firstSummary = topics[0]?.summary;
  const secondSummary = buildTrendingTopics(posts as never, 5)[0]?.summary;
  expect(firstSummary).toEqual(secondSummary);
  expect(firstSummary?.startsWith("DeSo users are discussing")).toBe(true);
});

test("topic detail resolves from canonical topic list", () => {
  const topics = buildTrendingTopics(posts as never, 5);
  const topic = findTopicBySlug(topics, topics[0].slug);
  expect(topic).toBeTruthy();
  expect(topic?.postHashes.length).toBeGreaterThan(0);
  expect(topic?.topPostHashes.length).toBeGreaterThan(0);
});
