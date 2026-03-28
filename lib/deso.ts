import { DESO_NODE_URL } from "@/lib/env";
import { AuthUser, DeSoPost } from "@/lib/types";

async function postJson<T>(path: string, body: object): Promise<T> {
  const response = await fetch(`${DESO_NODE_URL}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`DeSo request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getGlobalFeed(numToFetch = 40): Promise<DeSoPost[]> {
  const data = await postJson<{ HotFeedPage: DeSoPost[] }>("get-hot-feed", {
    ReaderPublicKeyBase58Check: "",
    NumToFetch: numToFetch,
    ResponseLimit: numToFetch,
  });
  return data.HotFeedPage ?? [];
}

export async function fetchHotFeedPage(seenPosts: string[], limit = 100): Promise<DeSoPost[]> {
  const data = await postJson<{ HotFeedPage: DeSoPost[] }>("get-hot-feed", {
    ReaderPublicKeyBase58Check: "",
    SeenPosts: seenPosts,
    ResponseLimit: limit,
  });

  return data.HotFeedPage ?? [];
}

export async function getTrendingPostPool(): Promise<DeSoPost[]> {
  const seenPosts: string[] = [];
  const unique = new Map<string, DeSoPost>();

  for (let page = 0; page < 4 && unique.size < 400; page += 1) {
    const posts = await fetchHotFeedPage(seenPosts, 100);
    if (!posts.length) break;

    for (const post of posts) {
      if (!post?.PostHashHex) continue;
      seenPosts.push(post.PostHashHex);
      if (!unique.has(post.PostHashHex)) {
        unique.set(post.PostHashHex, post);
        if (unique.size >= 400) break;
      }
    }
  }

  return [...unique.values()];
}

export async function getPostsByHashes(postHashes: string[]): Promise<DeSoPost[]> {
  const data = await postJson<{ PostsFound: Record<string, DeSoPost> }>("get-posts-stateless", {
    PostHashes: postHashes,
    ReaderPublicKeyBase58Check: "",
    AddGlobalFeedBool: false,
    FetchParents: false,
    CommentLimit: 0,
  });
  return Object.values(data.PostsFound || {});
}

export async function getProfile(username: string) {
  return postJson<{ Profile: { Username?: string; Description?: string; PublicKeyBase58Check: string } }>(
    "get-single-profile",
    {
      Username: username,
    },
  );
}

export async function getProfileByPublicKey(publicKey: string) {
  return postJson<{ Profile: { Username?: string; Description?: string; PublicKeyBase58Check: string } | null }>(
    "get-single-profile",
    {
      PublicKeyBase58Check: publicKey,
    },
  );
}

export function profilePicUrl(publicKey: string) {
  const base = DESO_NODE_URL.replace(/\/api\/v0\/?$/, "");
  return `${base}/api/v0/get-single-profile-picture/${publicKey}`;
}

export async function resolveAuthUser(publicKey: string): Promise<AuthUser> {
  const fallback: AuthUser = {
    publicKey,
    profilePic: profilePicUrl(publicKey),
  };

  try {
    const profile = await getProfileByPublicKey(publicKey);
    return {
      publicKey,
      username: profile.Profile?.Username,
      bio: profile.Profile?.Description,
      profilePic: profilePicUrl(publicKey),
    };
  } catch {
    return fallback;
  }
}

export async function getPostsForPublicKey(publicKey: string): Promise<DeSoPost[]> {
  const data = await postJson<{ Posts: DeSoPost[] }>("get-posts-for-public-key", {
    PublicKeyBase58Check: publicKey,
    NumToFetch: 30,
    MediaRequired: false,
  });
  return data.Posts ?? [];
}

export async function submitPost(
  publicKey: string,
  body: string,
  signTx: (hex: string) => Promise<string>,
  submitTx?: (hex: string) => Promise<{ TxnHashHex: string }>,
) {
  const txn = await postJson<{ TransactionHex: string }>("submit-post", {
    UpdaterPublicKeyBase58Check: publicKey,
    BodyObj: { Body: body },
    MinFeeRateNanosPerKB: 1000,
  });

  const signedHex = await signTx(txn.TransactionHex);

  if (submitTx) {
    return submitTx(signedHex);
  }

  return postJson<{ TxnHashHex: string }>("submit-transaction", {
    TransactionHex: signedHex,
  });
}
