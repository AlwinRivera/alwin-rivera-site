import { buildTwinPrompt } from "@/lib/twin";

// Picked by testing the free OpenRouter models against the twin prompt: fastest, and stays grounded.
// Later entries are tried in order only when earlier ones are rate-limited or down (OpenRouter fallback routing).
// Free models get retired, so OPENROUTER_MODELS in .env (comma-separated) can replace this list without a code change.
const DEFAULT_MODELS = [
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "dots-studio/dots-3-note-preview:free",
  "google/gemma-4-26b-a4b-it:free",
];
const MODELS =
  process.env.OPENROUTER_MODELS?.split(",")
    .map((m) => m.trim())
    .filter(Boolean) ?? DEFAULT_MODELS;
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const MAX_TURNS = 12;
const MAX_CHARS = 1200;
const MAX_BODY_BYTES = 32_000;
const RETRY_DELAYS_MS = [1500, 3500];
const UPSTREAM_TIMEOUT_MS = 25_000;
const RATE_LIMIT = { perIp: 10, windowMs: 60_000, dailyTotal: 300 };
const INTERRUPTED = "\n\n⚠️ Connection interrupted — please try again.";

export const maxDuration = 30;

type Msg = { role: "user" | "assistant"; content: string };

/* In-memory limits: fine for a single server process. On serverless hosts memory isn't shared
   between instances, so swap this for a shared store (e.g. Upstash Redis) when deploying there. */
const hits = new Map<string, { n: number; reset: number }>();
const daily = { n: 0, reset: 0 };

function allow(ip: string) {
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

export async function POST(req: Request) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return Response.json({ error: "The chat isn't configured yet." }, { status: 500 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  const limited = allow(ip);
  if (limited === "daily")
    return Response.json(
      { error: "I've answered a lot of questions today and I'm taking a break — email me instead!" },
      { status: 429 }
    );
  if (limited) return Response.json({ error: "Slow down a little — try again in a minute." }, { status: 429 });

  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES)
    return Response.json({ error: "Message too long." }, { status: 413 });

  let messages: Msg[];
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return Response.json({ error: "Message too long." }, { status: 413 });
    const body = JSON.parse(raw);
    messages = (Array.isArray(body?.messages) ? body.messages : [])
      .filter(
        (m: Msg) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim()
      )
      .slice(-MAX_TURNS)
      .map((m: Msg) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "Ask me something first." }, { status: 400 });
  }

  // One deadline for the whole exchange, retries included; the visitor leaving also cancels it.
  const signal = AbortSignal.any([req.signal, AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)]);

  const request = () =>
    fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": req.headers.get("origin") ?? "http://localhost:3000",
        "X-Title": "Alwin Rivera - Digital Twin",
      },
      body: JSON.stringify({
        models: MODELS.length ? MODELS : DEFAULT_MODELS,
        stream: true,
        temperature: 0.4,
        // Headroom for the hidden reasoning these models do before answering.
        max_tokens: 1500,
        reasoning: { effort: "low", exclude: true },
        messages: [{ role: "system", content: buildTwinPrompt() }, ...messages],
      }),
      signal,
    });

  let upstream: Response;
  try {
    // Free models share an upstream pool that rate-limits in bursts; back off and retry briefly.
    upstream = await request();
    for (const wait of RETRY_DELAYS_MS) {
      if (upstream.status !== 429 || signal.aborted) break;
      await upstream.body?.cancel();
      await new Promise((r) => setTimeout(r, wait));
      upstream = await request();
    }
  } catch (err) {
    if (!req.signal.aborted) console.error("OpenRouter request failed", err);
    return Response.json({ error: "I'm thinking too slowly right now. Please try again shortly." }, { status: 504 });
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    console.error("OpenRouter error", upstream.status, detail.slice(0, 500));
    const msg =
      upstream.status === 429
        ? "I'm getting a lot of questions right now — try again in a minute."
        : "I couldn't reach my brain just now. Please try again shortly.";
    return Response.json({ error: msg }, { status: 502 });
  }

  // Re-emit OpenRouter's SSE stream as plain text deltas for the client.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const emit = (line: string) => {
        const data = line.trim();
        if (!data.startsWith("data:")) return;
        const payload = data.slice(5).trim();
        if (payload === "[DONE]") return;
        try {
          const json = JSON.parse(payload);
          const delta: string | undefined = json.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        } catch {
          // Ignore keep-alive comments and partial frames.
        }
      };
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          lines.forEach(emit);
        }
        emit(buffer + decoder.decode());
      } catch (err) {
        if (!req.signal.aborted) {
          console.error("Stream error", err);
          controller.enqueue(encoder.encode(INTERRUPTED));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
