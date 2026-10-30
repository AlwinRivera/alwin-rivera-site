# Alwin Rivera — personal site

A Next.js portfolio site with an AI "digital twin" that answers questions about Alwin's career.

## Setup

Requires Node.js 20 or newer.

```bash
npm install
```

Create a `.env` file in the project root (it is git-ignored):

```
OPENROUTER_API_KEY=sk-or-v1-...
# Optional: comma-separated OpenRouter model IDs, tried in order. Defaults are in app/api/chat/route.ts.
# OPENROUTER_MODELS=nvidia/nemotron-3-ultra-550b-a55b:free,google/gemma-4-26b-a4b-it:free
```

Use a regular OpenRouter API key, not a management key.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build on port 3000 |

## Where things live

| Path | Contents |
|---|---|
| `lib/data.ts` | All profile content: career, skills, links, availability. The page and the twin both read it. |
| `lib/twin.ts` | The twin's system prompt, built from `lib/data.ts` |
| `app/page.tsx` | The page sections |
| `app/api/chat/route.ts` | Chat endpoint: validation, rate limiting, OpenRouter streaming |
| `components/` | Client-side components (nav, reveal animations, chat widget) |
| `app/globals.css` | All styles |

## Before deploying

- The chat rate limits are kept in memory, which only works on a single server. On serverless hosts such as Vercel, move them to a shared store (for example Upstash Redis).
- In OpenRouter **Settings → Privacy**, consider blocking providers that train on prompts.
- See `review.md` for the full code review and `tutorial.md` for a walkthrough of how the site works.
