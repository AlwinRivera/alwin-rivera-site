import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, RATE_LIMIT } from "@/lib/rate-limit";

/** A tiny stand-in for Upstash's REST pipeline endpoint, supporting INCR, EXPIRE and GET. */
function fakeUpstash() {
  const store = new Map<string, number>();
  return vi.fn(async (url: string, init: RequestInit) => {
    expect(url).toBe("https://redis.example/pipeline");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer secret");
    const commands: [string, string, number?][] = JSON.parse(String(init.body));
    const results = commands.map(([cmd, key]) => {
      if (cmd === "INCR") {
        store.set(key, (store.get(key) ?? 0) + 1);
        return { result: store.get(key) };
      }
      if (cmd === "GET") return { result: store.has(key) ? String(store.get(key)) : null };
      return { result: 1 }; // EXPIRE
    });
    return Response.json(results);
  });
}

beforeEach(() => {
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.example/";
  process.env.UPSTASH_REDIS_REST_TOKEN = "secret";
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("checkRateLimit with Upstash", () => {
  it("limits each visitor per window, independently", async () => {
    vi.stubGlobal("fetch", fakeUpstash());
    const results = [];
    for (let i = 0; i <= RATE_LIMIT.perIp; i++) results.push(await checkRateLimit("1.1.1.1"));
    expect(results.slice(0, RATE_LIMIT.perIp).every((r) => r === null)).toBe(true);
    expect(results.at(-1)).toBe("ip");
    expect(await checkRateLimit("2.2.2.2")).toBeNull();
  });

  it("stops everyone once the daily total is reached", async () => {
    vi.stubGlobal("fetch", fakeUpstash());
    for (let i = 0; i < RATE_LIMIT.dailyTotal; i++) {
      expect(await checkRateLimit(`10.${Math.floor(i / 250)}.${i % 250}.1`)).toBeNull();
    }
    expect(await checkRateLimit("9.9.9.9")).toBe("daily");
  });

  it("fails open if Upstash is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      })
    );
    expect(await checkRateLimit("3.3.3.3")).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });
});
