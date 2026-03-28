import { buildTrendingTopics, findTopicBySlug } from "@/lib/trending";

const baseNanos = Date.now() * 1e6;

const posts = [
  {
    PostHashHex: "a",
    Body: "#openfund builders are comparing grant updates and project milestones",
    TimestampNanos: baseNanos,
    PosterPublicKeyBase58Check: "pk1",
  },
  {
    PostHashHex: "b",
    Body: "#openfund community is discussing new application criteria and review changes",
    TimestampNanos: baseNanos - 1e9,
    PosterPublicKeyBase58Check: "pk2",
  },
  {
    PostHashHex: "c",
    Body: "#openfund contributors want more transparent funding milestones and launch clarity",
    TimestampNanos: baseNanos - 2e9,
    PosterPublicKeyBase58Check: "pk3",
  },
  {
    PostHashHex: "d",
    Body: "#openfund creators are sharing rollout feedback and project outcomes",
    TimestampNanos: baseNanos - 3e9,
    PosterPublicKeyBase58Check: "pk4",
  },
  {
    PostHashHex: "e",
    Body: "good morning everyone happy saturday and good weekend",
    TimestampNanos: baseNanos - 1e9,
    PosterPublicKeyBase58Check: "gm1",
  },
  {
    PostHashHex: "f",
    Body: "good morning deso family have a beautiful saturday",
    TimestampNanos: baseNanos - 2e9,
    PosterPublicKeyBase58Check: "gm2",
  },
  {
    PostHashHex: "g",
    Body: "good morning my friends and happy weekend",
    TimestampNanos: baseNanos - 3e9,
    PosterPublicKeyBase58Check: "gm3",
  },
  {
    PostHashHex: "h",
    Body: "mint now join now season 1 rewards at nftz.me",
    TimestampNanos: baseNanos - 1e9,
    PosterPublicKeyBase58Check: "spam1",
  },
  {
    PostHashHex: "i",
    Body: "mint now join now season 1 rewards at nftz.me",
    TimestampNanos: baseNanos - 2e9,
    PosterPublicKeyBase58Check: "spam2",
  },
  {
    PostHashHex: "j",
    Body: "mint now join now season 1 rewards at nftz.me",
    TimestampNanos: baseNanos - 3e9,
    PosterPublicKeyBase58Check: "spam3",
  },
];

test("clusters topics deterministically", () => {
  const first = buildTrendingTopics(posts as never, 6);
  const second = buildTrendingTopics(posts as never, 6);
  expect(first.map((topic) => topic.slug)).toEqual(second.map((topic) => topic.slug));
});

test("promotional spam is filtered out", () => {
  const topics = buildTrendingTopics(posts as never, 6);
  expect(topics.some((topic) => topic.summary.toLowerCase().includes("nftz.me"))).toBe(false);
});

test("low-signal greeting chatter is filtered out", () => {
  const topics = buildTrendingTopics(posts as never, 6);
  const combined = topics.map((topic) => `${topic.title} ${topic.summary}`.toLowerCase()).join(" ");
  expect(combined.includes("good morning")).toBe(false);
  expect(combined.includes("happy saturday")).toBe(false);
});

test("higher-signal recurring topics survive ranking", () => {
  const topics = buildTrendingTopics(posts as never, 6);
  expect(topics.some((topic) => topic.slug.includes("openfund"))).toBe(true);
});

test("summary generation is deterministic and not debate filler", () => {
  const topics = buildTrendingTopics(posts as never, 6);
  const firstSummary = topics[0]?.summary;
  const secondSummary = buildTrendingTopics(posts as never, 6)[0]?.summary;

  expect(firstSummary).toEqual(secondSummary);
  expect(firstSummary?.includes("gaining traction on DeSo")).toBe(true);
  expect(topics[0]?.title.toLowerCase().includes("debate")).toBe(false);
});

test("topic detail resolves from canonical topic list", () => {
  const topics = buildTrendingTopics(posts as never, 6);
  const topic = findTopicBySlug(topics, topics[0].slug);
  expect(topic).toBeTruthy();
  expect(topic?.postHashes.length).toBeGreaterThan(0);
  expect(topic?.topPostHashes.length).toBeGreaterThan(0);
});
