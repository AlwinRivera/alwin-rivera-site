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
# Optional locally, needed in production: shared rate-limit store (see "Deploying to Vercel").
# UPSTASH_REDIS_REST_URL=https://....upstash.io
# UPSTASH_REDIS_REST_TOKEN=...
# Optional: the public URL, for social previews and the sitemap. On Vercel the production URL is used if unset.
# SITE_URL=https://alwinrivera.dev
```

Use a regular OpenRouter API key, not a management key.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build on port 3000 |
| `npm run lint` | ESLint, with Next.js and full jsx-a11y accessibility rules |
| `npm run format` / `format:check` | Prettier: rewrite, or just check, formatting |
| `npm test` | Vitest unit tests in `tests/` (chat rendering, chat API, rate limiter; no network calls) |
| `npm run eval:twin` | Asks the running twin 7 tricky questions and checks the answers. Uses real OpenRouter quota. Pass a URL to test a deployed site. |

`npx tsc` runs TypeScript 7. ESLint's TypeScript support can't load TypeScript 7 yet, so `package.json` follows Microsoft's side-by-side setup: the `typescript` package is the TypeScript 6 compatibility build, and TypeScript 7 is installed as `@typescript/native`.

## Where things live

| Path | Contents |
|---|---|
| `lib/data.ts` | All profile content: career, skills, links, availability. The page and the twin both read it. |
| `lib/twin.ts` | The twin's system prompt, built from `lib/data.ts` |
| `app/page.tsx` | The page sections |
| `app/api/chat/route.ts` | Chat endpoint: validation, OpenRouter streaming |
| `lib/rate-limit.ts` | Chat rate limits: Upstash Redis when configured, otherwise in memory |
| `app/opengraph-image.tsx`, `app/robots.ts`, `app/sitemap.ts` | Social preview image and search-engine files |
| `components/` | Client-side components (nav, reveal animations, chat widget) |
| `app/globals.css` | All styles |

## Deploying to Vercel

1. **Push to GitHub.** Create an empty private repository on GitHub, then:
   ```bash
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
   Check first with `git status --ignored` that `.env` and `linkedin.pdf` are listed as ignored.
2. **Create a Redis database.** In Upstash, create a free Redis database and copy its **REST URL** and **REST token**.
3. **Import the project in Vercel** (Add New → Project → pick the repository). Vercel detects Next.js automatically.
4. **Add environment variables** in the import screen (or later in Settings → Environment Variables):
   - `OPENROUTER_API_KEY`: a regular OpenRouter key. Consider a separate key for production, with a credit limit.
   - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
   - `SITE_URL`: only once you have a custom domain.
5. **Deploy**, then run `npm run eval:twin -- https://<your-site>.vercel.app` to check the live twin.

Also worth doing:

- In OpenRouter **Settings → Privacy**, block providers that train on prompts.
- Move the project out of OneDrive. Besides syncing `.env` to the cloud, OneDrive turns old build folders into read-only placeholders, which makes `npm run build` fail with `EPERM` until you delete `.next`.
- See `review.md` for the full code review and `tutorial.md` for a walkthrough of how the site works.
