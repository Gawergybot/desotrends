# DeSoTrends MVP

DeSoTrends is a Diamond-inspired DeSo social client built with Next.js, TypeScript, and Tailwind. It includes DeSo feed browsing, DeSo Identity login, posting, profile pages, and a custom deterministic "Today’s News" trending engine.

## What is DeSo?

DeSo (Decentralized Social) is a blockchain designed for social applications. Frontends like this app read public content from DeSo nodes and use DeSo Identity for account login and transaction signing.

## Environment variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_DESO_NODE_URL=https://node.deso.org/api/v0
NEXT_PUBLIC_DESO_IDENTITY_URL=https://identity.deso.org
```

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## High-level architecture

- **App Router pages** for home feed, topic detail, and profiles.
- **Reusable UI components**: sidebar, topbar, composer, post cards, right rail, topic tabs.
- **Client data layer** using TanStack Query for feed/profile fetches and posting mutation.
- **DeSo API client** in `lib/deso.ts` for node interactions.
- **Identity helpers** in `lib/identity.ts` use the `deso-protocol` SDK (`configure`, `identity.login`, `identity.signTx`, `identity.submitTx`) with `https://identity.deso.org`.

## Login flow (MVP)

1. User clicks **Sign in with DeSo**.
2. App calls `identity.login()` via the DeSo SDK and Identity host (`https://identity.deso.org`).
3. Returned public key is hydrated with profile metadata (username, bio, profile picture URL when available) and stored in local storage for session persistence.
4. Posting uses DeSo transaction flow: construct transaction -> `identity.signTx()` -> `identity.submitTx()`.

## Trending system (deterministic, no AI APIs)

- Pulls one shared canonical recent public post pool (`useTrendingTopics`) used across home, profile, and topic pages.
- Uses a 24-hour analysis window.
- Cleans text (strip URLs, normalize punctuation/whitespace, remove stopwords).
- Extracts topic signals (hashtags/cashtags + dominant phrases).
- Clusters posts by key tokens.
- Applies ranking:
  - `score = uniqueAuthors*5 + postCount*2 + velocityBonus - spamPenalty - duplicatePenalty`
- Generates deterministic title/category/summary from representative posts.
- Topic detail supports **Top** and **Latest** tabs over actual clustered DeSo posts.

- `My Profile` routes through `/me` when no username is available yet, showing a guarded state for logged-out users.

## MVP limitations

- Identity integration is kept lightweight and may require additional production hardening for all signing edge cases.
- Feed/trend quality depends on the selected public node and endpoint behavior.
- Notifications, Discover, Messages, Wallet, and More routes are navigation stubs in this MVP.

## Validation commands

```bash
npm run lint
npm run build
npm run test
```
