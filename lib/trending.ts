import { DeSoPost, TopicCategory, TrendingTopic } from "@/lib/types";
import { cleanPostText } from "@/lib/text";

const DAY_NANOS = 24 * 60 * 60 * 1e9;
const MIN_POSTS_PER_TOPIC = 3;
const MIN_UNIQUE_AUTHORS = 3;
const MAX_SINGLE_AUTHOR_SHARE = 0.5;
const MAX_DUPLICATE_RATIO = 0.34;
const MAX_TOPICS = 5;

const STOP_TOKENS = new Set([
  "deso",
  "crypto",
  "nft",
  "earn",
  "rewards",
  "reward",
  "buy",
  "join",
  "mint",
  "market",
  "marketplace",
  "holders",
  "holder",
  "today",
  "post",
  "posts",
  "discussion",
  "spark",
  "sparks",
  "season",
  "plan",
]);

const PROMO_REGEX = /(mint|holders?|reward|rewards|buy now|join now|marketplace|season one|season 1|nftz\.me|http|https|www\.)/i;

type CandidateKind = "hashtag" | "cashtag" | "phrase";

type TopicCandidate = {
  key: string;
  normalized: string;
  kind: CandidateKind;
  posts: DeSoPost[];
};

function categoryForCandidate(candidate: string): TopicCategory {
  if (candidate.startsWith("$") || /(token|coin|blockchain|market)/i.test(candidate)) return "Crypto";
  if (/(breaking|government|policy|court|sec|election|fund)/i.test(candidate)) return "News";
  return "Other";
}

function normalizeWord(word: string) {
  return word.replace(/[^a-z0-9#$]/gi, "").toLowerCase();
}

function getPhrases(text: string): string[] {
  const tokens = text
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.replace(/[^a-z0-9]/g, ""))
    .filter((token) => token.length >= 3 && !STOP_TOKENS.has(token));

  const phrases: string[] = [];
  for (let i = 0; i < tokens.length; i += 1) {
    if (i + 1 < tokens.length) phrases.push(`${tokens[i]} ${tokens[i + 1]}`);
    if (i + 2 < tokens.length) phrases.push(`${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`);
  }
  return phrases;
}

function getCandidateTokens(post: DeSoPost): { hashtags: string[]; cashtags: string[]; phrases: string[] } {
  const cleaned = cleanPostText(post.Body);
  const hashtags = [...cleaned.matchAll(/#[a-z0-9_]{2,}/gi)].map((m) => m[0].toLowerCase());
  const cashtags = [...cleaned.matchAll(/\$[a-z0-9_]{2,}/gi)].map((m) => m[0].toLowerCase());
  return { hashtags, cashtags, phrases: getPhrases(cleaned) };
}

function humanizeCandidate(candidate: string): string {
  const base = candidate.replace(/^[#$]/, "").replace(/[_-]+/g, " ").trim();
  return base || candidate;
}

function titleForCandidate(candidate: string, kind: CandidateKind): string {
  const readable = humanizeCandidate(candidate);
  if (kind === "hashtag") return `${readable} activity draws discussion`;
  if (kind === "cashtag") return `${readable} mentioned across recent posts`;
  return `${readable} debate`;
}

function buildSummary(topicLabel: string, posts: DeSoPost[]): string {
  const representative = [...posts]
    .filter((post) => cleanPostText(post.Body).length > 12)
    .sort((a, b) => b.TimestampNanos - a.TimestampNanos)
    .slice(0, 3)
    .map((post) => cleanPostText(post.Body))
    .map((text) => text.slice(0, 150));

  const paragraph1 = `DeSo users are discussing ${topicLabel}.`;
  const paragraph2 = representative.length
    ? representative.map((line) => `• ${line}`).join("\n")
    : "Participants are still adding context in recent posts.";

  return `${paragraph1}\n\n${paragraph2}`;
}

function velocityBonus(posts: DeSoPost[]): number {
  const now = Date.now() * 1e6;
  const oneHour = posts.filter((p) => now - p.TimestampNanos < 1 * 60 * 60 * 1e9).length;
  const sixHours = posts.filter((p) => now - p.TimestampNanos < 6 * 60 * 60 * 1e9).length;
  return oneHour * 3 + Math.max(0, sixHours - oneHour);
}

function buildCandidates(posts: DeSoPost[]): TopicCandidate[] {
  const tracker = new Map<string, { kind: CandidateKind; posts: DeSoPost[]; authors: Set<string> }>();

  for (const post of posts) {
    const { hashtags, cashtags, phrases } = getCandidateTokens(post);
    const grouped = [
      ...hashtags.map((token) => ({ token, kind: "hashtag" as const })),
      ...cashtags.map((token) => ({ token, kind: "cashtag" as const })),
      ...phrases.map((token) => ({ token, kind: "phrase" as const })),
    ];

    for (const item of grouped) {
      const normalized = item.kind === "phrase" ? item.token.toLowerCase() : normalizeWord(item.token);
      const rejectToken = item.kind !== "phrase" && STOP_TOKENS.has(normalized.replace(/^[#$]/, ""));
      if (!normalized || rejectToken) continue;

      const key = `${item.kind}:${normalized}`;
      const current = tracker.get(key) ?? { kind: item.kind, posts: [], authors: new Set<string>() };
      current.posts.push(post);
      current.authors.add(post.PosterPublicKeyBase58Check);
      tracker.set(key, current);
    }
  }

  return [...tracker.entries()]
    .filter(([, value]) => value.authors.size >= MIN_UNIQUE_AUTHORS)
    .map(([key, value]) => ({
      key,
      kind: value.kind,
      normalized: key.split(":")[1],
      posts: value.posts,
    }));
}

export function buildTrendingTopics(posts: DeSoPost[], limit = MAX_TOPICS): TrendingTopic[] {
  const cutoff = Date.now() * 1e6 - DAY_NANOS;
  const fresh = posts.filter((p) => p.TimestampNanos >= cutoff && cleanPostText(p.Body).length > 8);
  const candidates = buildCandidates(fresh);

  const topics = candidates
    .map((candidate) => {
      const dedupedPosts = new Map(candidate.posts.map((post) => [post.PostHashHex, post]));
      const groupedPosts = [...dedupedPosts.values()];
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

      const candidateBase = candidate.normalized.replace(/^[#$]/, "");
      const isRejected =
        postCount < MIN_POSTS_PER_TOPIC ||
        uniqueAuthors < MIN_UNIQUE_AUTHORS ||
        singleAuthorShare > MAX_SINGLE_AUTHOR_SHARE ||
        duplicateRatio > MAX_DUPLICATE_RATIO ||
        promotionalRatio > 0.5 ||
        STOP_TOKENS.has(candidateBase);

      if (isRejected) return null;

      const velocity = velocityBonus(groupedPosts);
      const spamPenalty = Math.round(singleAuthorShare * 10);
      const duplicatePenalty = Math.round(duplicateRatio * 12);
      const promoPenalty = Math.round(promotionalRatio * 14);

      const sortedPosts = [...groupedPosts].sort((a, b) => b.TimestampNanos - a.TimestampNanos);
      const topicLabel = humanizeCandidate(candidate.normalized);
      const score = uniqueAuthors * 8 + postCount * 2 + velocity - spamPenalty - duplicatePenalty - promoPenalty;

      return {
        slug: encodeURIComponent(candidate.normalized.replace(/\s+/g, "-").toLowerCase()),
        title: titleForCandidate(candidate.normalized, candidate.kind),
        updatedAtNanos: sortedPosts[0]?.TimestampNanos ?? 0,
        summary: buildSummary(topicLabel, sortedPosts),
        category: categoryForCandidate(candidate.normalized),
        postCount,
        score,
        postHashes: sortedPosts.map((post) => post.PostHashHex),
        topPostHashes: sortedPosts.slice(0, 6).map((post) => post.PostHashHex),
      } satisfies TrendingTopic;
    })
    .filter((topic): topic is TrendingTopic => Boolean(topic));

  return topics.sort((a, b) => b.score - a.score).slice(0, Math.min(limit, MAX_TOPICS));
}

export function findTopicBySlug(topics: TrendingTopic[], slug: string) {
  return topics.find((t) => t.slug === slug);
}
