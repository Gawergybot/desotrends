export type DeSoPost = {
  PostHashHex: string;
  Body: string;
  TimestampNanos: number;
  PosterPublicKeyBase58Check: string;
  ProfileEntryResponse?: {
    Username?: string;
    Description?: string;
    PublicKeyBase58Check?: string;
    ExtraData?: Record<string, string>;
  };
};

export type TopicCategory = "Crypto" | "News" | "Other";

export type TrendingTopic = {
  slug: string;
  title: string;
  updatedAtNanos: number;
  summary: string;
  category: TopicCategory;
  postCount: number;
  score: number;
  postHashes: string[];
  topPostHashes: string[];
};

export type AuthUser = {
  publicKey: string;
  username?: string;
  profilePic?: string;
  bio?: string;
};
