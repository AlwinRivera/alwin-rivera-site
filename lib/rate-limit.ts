/* Chat rate limits: a per-visitor cap plus a daily total that protects the OpenRouter quota.

   With UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN set (e.g. on Vercel), counts live in Upstash Redis
   so every serverless instance shares them. Without them, counts live in this process's memory, which is
   fine for local use or a single long-running server. */

export const RATE_LIMIT = { perIp: 10, windowMs: 60_000, dailyTotal: 300 };

export type Limited = "ip" | "daily" | null;

export async function checkRateLimit(ip: string): Promise<Limited> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return checkInMemory(ip);
  try {
    return await checkInRedis(ip, url, token);
  } catch (err) {
    // Fail open: a Redis outage shouldn't take the chat down. The daily cap in OpenRouter still applies.
    console.error("Rate limit store unavailable", err);
    return null;
  }
}

/* ── Shared store: fixed windows keyed by minute and by day ── */

async function redis(url: string, token: string, commands: (string | number)[][]) {
  const res = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(2000),
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}`);
  const out: { result?: unknown; error?: string }[] = await res.json();
  const failed = out.find((r) => r.error);
  if (failed) throw new Error(`Upstash: ${failed.error}`);
  return out.map((r) => r.result);
}

async function checkInRedis(ip: string, url: string, token: string): Promise<Limited> {
  const now = Date.now();
  const ipKey = `twin:ip:${ip}:${Math.floor(now / RATE_LIMIT.windowMs)}`;
  const dayKey = `twin:day:${new Date(now).toISOString().slice(0, 10)}`;
  const windowSecs = Math.ceil(RATE_LIMIT.windowMs / 1000);

  const [ipCount, dayCount] = await redis(url, token, [
    ["INCR", ipKey],
    ["EXPIRE", ipKey, windowSecs],
    ["GET", dayKey],
  ]).then((r) => [Number(r[0]), Number(r[2] ?? 0)]);

  if (dayCount >= RATE_LIMIT.dailyTotal) return "daily";
  if (ipCount > RATE_LIMIT.perIp) return "ip";

  // Only requests that go through count toward the daily total.
  await redis(url, token, [
    ["INCR", dayKey],
    ["EXPIRE", dayKey, 2 * 86_400],
  ]);
  return null;
}

/* ── Fallback: this process's memory ── */

const hits = new Map<string, { n: number; reset: number }>();
const daily = { n: 0, reset: 0 };

function checkInMemory(ip: string): Limited {
  const now = Date.now();
  if (now > daily.reset) Object.assign(daily, { n: 0, reset: now + 86_400_000 });
  if (daily.n >= RATE_LIMIT.dailyTotal) return "daily";

  for (const [k, e] of hits) if (now > e.reset) hits.delete(k);
  const e = hits.get(ip);
  if (!e) hits.set(ip, { n: 1, reset: now + RATE_LIMIT.windowMs });
  else if (++e.n > RATE_LIMIT.perIp) return "ip";

  daily.n++;
  return null;
}
