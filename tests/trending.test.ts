import { buildTrendingTopics, findTopicBySlug } from "@/lib/trending";

const baseNanos = Date.now() * 1e6;

const posts = [
  { PostHashHex: "a", Body: "#focus DeSo creator rewards discussion", TimestampNanos: baseNanos, PosterPublicKeyBase58Check: "pk1" },
  { PostHashHex: "b", Body: "#focus creator rewards are changing", TimestampNanos: baseNanos - 1e9, PosterPublicKeyBase58Check: "pk2" },
  { PostHashHex: "c", Body: "#focus creator rewards are changing", TimestampNanos: baseNanos - 2e9, PosterPublicKeyBase58Check: "pk2" },
  { PostHashHex: "d", Body: "$DESO market update and adoption", TimestampNanos: baseNanos - 3e9, PosterPublicKeyBase58Check: "pk3" },
  { PostHashHex: "e", Body: "$DESO market update and adoption", TimestampNanos: baseNanos - 4e9, PosterPublicKeyBase58Check: "pk4" },
];

test("clusters topics deterministically", () => {
  const first = buildTrendingTopics(posts as never, 5);
  const second = buildTrendingTopics(posts as never, 5);
  expect(first.map((t) => t.slug)).toEqual(second.map((t) => t.slug));
});

test("duplicate spam is penalized", () => {
  const topics = buildTrendingTopics(posts as never, 5);
  const focus = topics.find((t) => t.slug.includes("focus"));
  const deso = topics.find((t) => t.slug.includes("$deso"));
  expect(focus && deso).toBeTruthy();
  expect((focus?.score ?? 0) < (deso?.score ?? 1000)).toBe(true);
});

test("summary generation is deterministic", () => {
  const topics = buildTrendingTopics(posts as never, 5);
  const firstSummary = topics[0]?.summary;
  const secondSummary = buildTrendingTopics(posts as never, 5)[0]?.summary;
  expect(firstSummary).toEqual(secondSummary);
});

test("topic detail resolves from canonical topic list", () => {
  const topics = buildTrendingTopics(posts as never, 5);
  const topic = findTopicBySlug(topics, topics[0].slug);
  expect(topic).toBeTruthy();
  expect(topic?.postHashes.length).toBeGreaterThan(0);
  expect(topic?.topPostHashes.length).toBeGreaterThan(0);
});
