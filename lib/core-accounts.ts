import { DeSoPost } from "@/lib/types";

const CORE_ACCOUNT_USERNAMES = new Set([
  "nader",
  "mossified",
  "lazynina",
  "zordon",
  "wintercounter",
  "deso",
  "maebeam",
  "jacksondean",
  "petern",
  "sofonias",
  "jasonm",
  "stas_kh",
  "isaacisaac",
  "focus",
  "openfund",
]);

const CORE_ACCOUNT_PUBLIC_KEYS = new Set<string>([]);

export function normalizeCoreUsername(username?: string | null) {
  if (!username) return "";
  return username.replace(/^@/, "").trim().toLowerCase();
}

export function isCoreUsername(username?: string | null) {
  return CORE_ACCOUNT_USERNAMES.has(normalizeCoreUsername(username));
}

export function isCorePublicKey(publicKey?: string | null) {
  if (!publicKey) return false;
  return CORE_ACCOUNT_PUBLIC_KEYS.has(publicKey);
}

export function isCoreAccount(post: DeSoPost) {
  const username = post.ProfileEntryResponse?.Username?.toLowerCase() ?? "";
  const publicKey = post.PosterPublicKeyBase58Check;
  return isCoreUsername(username) || isCorePublicKey(publicKey);
}

export function filterCorePosts(posts: DeSoPost[]) {
  return posts.filter(isCoreAccount);
}
