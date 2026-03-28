import { DeSoPost, TopicCategory, TrendingTopic } from "@/lib/types";
import { cleanPostText } from "@/lib/text";

const DAY_NANOS = 24 * 60 * 60 * 1e9;
const MIN_POSTS_PER_TOPIC = 4;
const MIN_UNIQUE_AUTHORS = 3;
const MAX_SINGLE_AUTHOR_SHARE = 0.45;
const MAX_DUPLICATE_RATIO = 0.4;
const MAX_TOPICS = 6;

const HARD_STOP_TOKENS = new Set([
  "deso",
  "crypto",
  "nft",
  "earn",
  "reward",
  "rewards",
  "buy",
  "join",
  "mint",
  "market",
  "marketplace",
  "holder",
  "holders",
  "today",
  "post",
  "posts",
  "discussion",
  "spark",
  "sparks",
  "season",
  "plan",
  "gm",
  "morning",
  "night",
  "weekend",
  "saturday",
  "sunday",
  "thank",
  "thanks",
  "hello",
  "hi",
  "beautiful",
  "lovely",
  "happy",
  "family",
  "wonderful",
]);

const HARD_STOP_PHRASES = [
  "good morning",
  "gm",
  "thank you",
  "happy weekend",
  "happy saturday",
  "have a nice day",
  "wonderful day",
  "good night",
  "great project",
  "nice project",
  "good project",
];

const PROMO_REGEX =
  /(mint|holders?|reward|rewards|buy now|join now|marketplace|season one|season 1|nftz\.me|http|https|www\.|airdrop|follow back|dm me)/i;

type CandidateKind = "hashtag" | "cashtag" | "phrase";

type CandidateRecord = {
  key: string;
  normalized: string;
  kind: CandidateKind;
  posts: DeSoPost[];
  authors: Set<string>;
};

function normalizeWord(word: string) {
  return word.replace(/[^a-z0-9#$]/gi, "").toLowerCase();
}

function normalizePhrase(input: string) {
  return input
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(input: string) {
  return input
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function candidateLabel(normalized: string) {
  return normalized.replace(/^[#$]/, "").replace(/[_-]+/g, " ").trim();
}

function isLowSignalPhrase(phrase: string) {
  if (!phrase) return true;
  if (HARD_STOP_PHRASES.includes(phrase)) return true;

  const tokens = phrase.split(" ").filter(Boolean);
  if (!tokens.length) return true;
  if (tokens.every((token) => HARD_STOP_TOKENS.has(token))) return true;
  if (tokens.some((token) => token.length < 3)) return true;

  return false;
}

function keywordTokens(text: string) {
  return normalizePhrase(text)
    .split(" ")
    .filter((token) => token.length >= 3)
    .filter((token) => !HARD_STOP_TOKENS.has(token));
}

function extractHashtags(text: string) {
  return [...text.matchAll(/#[a-z0-9_]{2,}/gi)].map((match) => match[0].toLowerCase());
}

function extractCashtags(text: string) {
  return [...text.matchAll(/\$[a-z0-9_]{2,}/gi)].map((match) => match[0].toLowerCase());
}

function extractPhraseCandidates(text: string) {
  const tokens = keywordTokens(text);
  const phrases: string[] = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const twoWord = tokens.slice(index, index + 2).join(" ").trim();
    const threeWord = tokens.slice(index, index + 3).join(" ").trim();

    if (twoWord && !isLowSignalPhrase(twoWord)) phrases.push(twoWord);
    if (threeWord && !isLowSignalPhrase(threeWord)) phrases.push(threeWord);
  }

  return phrases;
}

function categoryForCandidate(candidate: string, kind: CandidateKind): TopicCategory {
  if (kind === "cashtag" || candidate.startsWith("$") || /(token|coin|blockchain|market|price)/i.test(candidate)) {
    return "Crypto";
  }

  if (/(breaking|government|policy|court|sec|election|fund|launch|rollout|update|issue|bug|login)/i.test(candidate)) {
    return "News";
  }

  return "Other";
}

function titleForCandidate(normalized: string, kind: CandidateKind) {
  const readable = candidateLabel(normalized);
  const titled = titleCase(readable);

  if (kind === "cashtag") return `${titled} gets fresh attention`;
  if (kind === "hashtag") return `${titled} trends on DeSo`;
  return `${titled} picks up steam`;
}

function burstScore(posts: DeSoPost[]) {
  const now = Date.now() * 1e6;
  const oneHour = posts.filter((post) => now - post.TimestampNanos < 1 * 60 * 60 * 1e9).length;
  const threeHours = posts.filter((post) => now - post.TimestampNanos < 3 * 60 * 60 * 1e9).length;
  return oneHour * 5 + Math.max(0, threeHours - oneHour) * 2;
}

function representativePosts(posts: DeSoPost[]) {
  return [...posts]
    .sort((a, b) => b.TimestampNanos - a.TimestampNanos)
    .filter((post) => cleanPostText(post.Body).length >= 20)
    .slice(0, 5);
}

function summaryKeywords(topicLabel: string, posts: DeSoPost[]) {
  const labelTokens = new Set(keywordTokens(topicLabel));
  const counts = new Map<string, number>();

  for (const post of representativePosts(posts)) {
    for (const token of keywordTokens(post.Body)) {
      if (labelTokens.has(token)) continue;
      if (HARD_STOP_TOKENS.has(token)) continue;
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0]);
    })
    .slice(0, 3)
    .map(([token]) => token);
}

function buildSummary(topicLabel: string, posts: DeSoPost[], uniqueAuthors: number): string {
  const lead = `${topicLabel} is gaining traction on DeSo with ${posts.length} recent posts from ${uniqueAuthors} different accounts.`;
  const keywords = summaryKeywords(topicLabel, posts);

  if (keywords.length) {
    return `${lead}\n\nCommon angles mention ${keywords.join(", ")}.`;
  }

  const snippet = representativePosts(posts)
    .map((post) => cleanPostText(post.Body))
    .find(Boolean);

  if (snippet) {
    return `${lead}\n\nRepresentative posts mention ${snippet.slice(0, 140)}.`;
  }

  return `${lead}\n\nUsers are still adding context to this story.`;
}

function buildCandidates(posts: DeSoPost[]): CandidateRecord[] {
  const tracker = new Map<string, CandidateRecord>();

  for (const post of posts) {
    const cleaned = cleanPostText(post.Body);
    const grouped = [
      ...extractHashtags(cleaned).map((token) => ({ token, kind: "hashtag" as const })),
      ...extractCashtags(cleaned).map((token) => ({ token, kind: "cashtag" as const })),
      ...extractPhraseCandidates(cleaned).map((token) => ({ token, kind: "phrase" as const })),
    ];

    for (const item of grouped) {
      const normalized = item.kind === "phrase" ? normalizePhrase(item.token) : normalizeWord(item.token);
      const baseLabel = candidateLabel(normalized);

      if (!normalized) continue;
      if (!baseLabel) continue;
      if (isLowSignalPhrase(baseLabel)) continue;
      if (HARD_STOP_TOKENS.has(baseLabel)) continue;

      const key = `${item.kind}:${normalized}`;
      const current =
        tracker.get(key) ??
        ({
          key,
          normalized,
          kind: item.kind,
          posts: [],
          authors: new Set<string>(),
        } satisfies CandidateRecord);

      current.posts.push(post);
      current.authors.add(post.PosterPublicKeyBase58Check);
      tracker.set(key, current);
    }
  }

  return [...tracker.values()];
}

export function buildTrendingTopics(posts: DeSoPost[], limit = MAX_TOPICS): TrendingTopic[] {
  const cutoff = Date.now() * 1e6 - DAY_NANOS;
  const fresh = posts.filter((post) => post.TimestampNanos >= cutoff && cleanPostText(post.Body).length > 12);
  const candidates = buildCandidates(fresh);

  const topics = candidates
    .map((candidate) => {
      const dedupedPosts = new Map(candidate.posts.map((post) => [post.PostHashHex, post]));
      const groupedPosts = [...dedupedPosts.values()].sort((a, b) => b.TimestampNanos - a.TimestampNanos);

      const authorCounts = groupedPosts.reduce<Record<string, number>>((acc, post) => {
        acc[post.PosterPublicKeyBase58Check] = (acc[post.PosterPublicKeyBase58Check] || 0) + 1;
        return acc;
      }, {});

      const postCount = groupedPosts.length;
      const uniqueAuthors = Object.keys(authorCounts).length;
      const largestAuthorCount = Math.max(...Object.values(authorCounts));
      const singleAuthorShare = largestAuthorCount / postCount;

      const normalizedBodies = groupedPosts.map((post) => cleanPostText(post.Body));
      const uniqueBodyCount = new Set(normalizedBodies).size;
      const duplicateRatio = postCount > 0 ? (postCount - uniqueBodyCount) / postCount : 1;
      const promotionalRatio = postCount > 0 ? groupedPosts.filter((post) => PROMO_REGEX.test(post.Body)).length / postCount : 1;

      const label = candidateLabel(candidate.normalized);

      const isRejected =
        postCount < MIN_POSTS_PER_TOPIC ||
        uniqueAuthors < MIN_UNIQUE_AUTHORS ||
        singleAuthorShare > MAX_SINGLE_AUTHOR_SHARE ||
        duplicateRatio > MAX_DUPLICATE_RATIO ||
        promotionalRatio > 0.5 ||
        isLowSignalPhrase(label);

      if (isRejected) return null;

      const score =
        uniqueAuthors * 10 +
        uniqueBodyCount * 6 +
        postCount * 3 +
        burstScore(groupedPosts) +
        (candidate.kind === "hashtag" ? 3 : 0) +
        (candidate.kind === "cashtag" ? 5 : 0) -
        Math.round(singleAuthorShare * 20) -
        Math.round(duplicateRatio * 16) -
        Math.round(promotionalRatio * 20);

      return {
        slug: encodeURIComponent(`${candidate.kind}-${label.replace(/\s+/g, "-").toLowerCase()}`),
        title: titleForCandidate(candidate.normalized, candidate.kind),
        updatedAtNanos: groupedPosts[0]?.TimestampNanos ?? 0,
        summary: buildSummary(label, groupedPosts, uniqueAuthors),
        category: categoryForCandidate(candidate.normalized, candidate.kind),
        postCount,
        score,
        postHashes: groupedPosts.map((post) => post.PostHashHex),
        topPostHashes: groupedPosts.slice(0, 6).map((post) => post.PostHashHex),
      } satisfies TrendingTopic;
    })
    .filter((topic): topic is TrendingTopic => Boolean(topic));

  return topics.sort((a, b) => b.score - a.score).slice(0, Math.min(limit, MAX_TOPICS));
}

export function findTopicBySlug(topics: TrendingTopic[], slug: string) {
  return topics.find((topic) => topic.slug === slug);
}
