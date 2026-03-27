import { DeSoPost, TopicCategory, TrendingTopic } from "@/lib/types";
import { cleanPostText, extractTokens } from "@/lib/text";

const DAY_NANOS = 24 * 60 * 60 * 1e9;

function categoryForTokens(tokens: string[]): TopicCategory {
  const t = tokens.join(" ");
  if (/(bitcoin|btc|eth|sol|deso|token|nft|crypto|\$)/.test(t)) return "Crypto";
  if (/(breaking|news|election|government|policy|court|sec)/.test(t)) return "News";
  return "Other";
}

function titleFromTokens(tokens: string[]): string {
  const keyword = tokens.find((t) => t.startsWith("#") || t.startsWith("$")) || tokens[0] || "DeSo";
  const cleaned = keyword.replace(/^[#$]/, "").toUpperCase();
  return `${cleaned} Sparks Discussion on DeSo`;
}

function summaryFromPosts(posts: DeSoPost[], title: string): string {
  const snippets = posts
    .map((p) => cleanPostText(p.Body))
    .filter(Boolean)
    .slice(0, 3);

  const paragraph1 = `Users are discussing ${title.toLowerCase()} across recent DeSo posts. Several posts focus on recurring updates, reactions, and community viewpoints.`;
  const paragraph2 = snippets.length
    ? `The conversation centers on: ${snippets.map((s) => `“${s.slice(0, 100)}”`).join(" • ")}.`
    : "The conversation is still developing as new posts are published.";

  return `${paragraph1}\n\n${paragraph2}`;
}

function computeVelocity(posts: DeSoPost[]): number {
  const now = Date.now() * 1e6;
  const last2h = posts.filter((p) => now - p.TimestampNanos < 2 * 60 * 60 * 1e9).length;
  return last2h * 2;
}

export function buildTrendingTopics(posts: DeSoPost[], limit = 5): TrendingTopic[] {
  const cutoff = Date.now() * 1e6 - DAY_NANOS;
  const fresh = posts.filter((p) => p.TimestampNanos >= cutoff && cleanPostText(p.Body).length > 6);

  const groups = new Map<string, DeSoPost[]>();
  for (const post of fresh) {
    const tokens = extractTokens(post.Body);
    const keyToken = tokens.find((t) => t.startsWith("#") || t.startsWith("$")) || tokens.slice(0, 3).join("-");
    if (!keyToken) continue;
    const key = keyToken.replace(/[^a-z0-9#$-]/gi, "");
    const current = groups.get(key) ?? [];
    current.push(post);
    groups.set(key, current);
  }

  const topics: TrendingTopic[] = [...groups.entries()].map(([key, groupedPosts]) => {
    const normalizedBodies = groupedPosts.map((p) => cleanPostText(p.Body));
    const dedup = new Set(normalizedBodies);
    const duplicatePenalty = normalizedBodies.length - dedup.size;

    const authorCounts = groupedPosts.reduce<Record<string, number>>((acc, p) => {
      acc[p.PosterPublicKeyBase58Check] = (acc[p.PosterPublicKeyBase58Check] || 0) + 1;
      return acc;
    }, {});

    const uniqueAuthors = Object.keys(authorCounts).length;
    const spamPenalty = Object.values(authorCounts)
      .filter((count) => count > 3)
      .reduce((sum, count) => sum + (count - 3), 0);

    const dominantTokens = extractTokens(groupedPosts.map((p) => p.Body).join(" "));
    const topPosts = [...groupedPosts].sort((a, b) => b.TimestampNanos - a.TimestampNanos).slice(0, 15);
    const score = uniqueAuthors * 5 + groupedPosts.length * 2 + computeVelocity(groupedPosts) - spamPenalty - duplicatePenalty;
    const title = titleFromTokens(dominantTokens);

    return {
      slug: encodeURIComponent(key.toLowerCase()),
      title,
      updatedAtNanos: Math.max(...groupedPosts.map((p) => p.TimestampNanos)),
      summary: summaryFromPosts(topPosts, title),
      category: categoryForTokens(dominantTokens),
      postCount: groupedPosts.length,
      score,
      postHashes: topPosts.map((p) => p.PostHashHex),
      topPostHashes: topPosts.slice(0, 6).map((p) => p.PostHashHex),
    };
  });

  return topics
    .filter((t) => t.postCount >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function findTopicBySlug(topics: TrendingTopic[], slug: string) {
  return topics.find((t) => t.slug === slug);
}
