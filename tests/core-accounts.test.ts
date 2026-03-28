import { filterCorePosts } from "@/lib/core-accounts";

test("core filter keeps only allowlisted usernames", () => {
  const posts = [
    {
      PostHashHex: "1",
      Body: "official post",
      TimestampNanos: 1,
      PosterPublicKeyBase58Check: "pk1",
      ProfileEntryResponse: { Username: "deso" },
    },
    {
      PostHashHex: "2",
      Body: "random post",
      TimestampNanos: 2,
      PosterPublicKeyBase58Check: "pk2",
      ProfileEntryResponse: { Username: "randomuser" },
    },
    {
      PostHashHex: "3",
      Body: "core team post",
      TimestampNanos: 3,
      PosterPublicKeyBase58Check: "pk3",
      ProfileEntryResponse: { Username: "focus" },
    },
  ];

  const filtered = filterCorePosts(posts as never);
  expect(filtered.map((post) => post.PostHashHex)).toEqual(["1", "3"]);
});

test("isCoreUsername accepts allowlisted handles with or without @", async () => {
  const { isCoreUsername } = await import("@/lib/core-accounts");

  expect(isCoreUsername("deso")).toBe(true);
  expect(isCoreUsername("@deso")).toBe(true);
  expect(isCoreUsername("focus")).toBe(true);
  expect(isCoreUsername("@focus")).toBe(true);
  expect(isCoreUsername("randomuser")).toBe(false);
});
