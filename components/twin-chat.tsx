"use client";

import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };

export const OPEN_TWIN_EVENT = "open-twin";

const SUGGESTIONS = [
  "What do you do at Channext?",
  "Walk me through your career",
  "What's your approach to accessibility?",
  "Are you open to new projects?",
];

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hey — I'm Alwin's **digital twin**, an AI that knows my professional profile. Ask me about my experience, skills or how I work.",
};

export function TwinChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_TWIN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_TWIN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 250);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || busy) return;

      const history = [...messages.filter((m) => m !== GREETING && !m.error), { role: "user" as const, content: question }];
      setMessages((m) => [...m, { role: "user", content: question }, { role: "assistant", content: "" }]);
      setInput("");
      setBusy(true);

      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const patchLast = (fn: (m: Msg) => Msg) =>
        setMessages((all) => [...all.slice(0, -1), fn(all[all.length - 1])]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
          signal: ctrl.signal,
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Something went wrong. Please try again.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let received = false;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) received = true;
          patchLast((m) => ({ ...m, content: m.content + chunk }));
        }
        if (!received) throw new Error("I drew a blank there — mind asking again?");
      } catch (err) {
        if (ctrl.signal.aborted) return;
        patchLast(() => ({
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong.",
          error: true,
        }));
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, messages]
  );

  const reset = () => {
    abortRef.current?.abort();
    setBusy(false);
    setMessages([GREETING]);
  };

  const showSuggestions = messages.length === 1;

  return (
    <>
      <button
        type="button"
        className={`twin-fab ${open ? "is-hidden" : ""}`}
        onClick={() => setOpen(true)}
        aria-label="Chat with Alwin's digital twin"
      >
        <span className="twin-avatar" aria-hidden>
          AR<span className="twin-avatar__dot" />
        </span>
        <span className="twin-fab__text">
          <span className="twin-fab__title">Ask my digital twin</span>
          <span className="twin-fab__sub mono">AI · online</span>
        </span>
      </button>

      <section
        className={`twin ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="false"
        aria-label="Digital twin chat"
        aria-hidden={!open}
        inert={!open}
      >
        <header className="twin__head">
          <span className="twin-avatar" aria-hidden>
            AR<span className="twin-avatar__dot" />
          </span>
          <div className="twin__id">
            <span className="twin__name">Alwin Rivera</span>
            <span className="twin__role mono">Digital twin · AI</span>
          </div>
          <button type="button" className="twin__icon" onClick={reset} aria-label="Start a new chat" title="New chat">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9M2.5 2.5v3h3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <button type="button" className="twin__icon" onClick={() => setOpen(false)} aria-label="Close chat">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </header>

        <div className="twin__list" ref={listRef} aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`bubble bubble--${m.role} ${m.error ? "bubble--error" : ""}`}>
              {m.content ? (
                <RichText text={m.content} />
              ) : (
                <span className="typing" aria-label="Typing">
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </div>
          ))}

          {showSuggestions && (
            <div className="twin__suggest">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          className="twin__form"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            maxLength={1200}
            placeholder="Ask about my experience…"
            aria-label="Your question"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
          />
          <button type="submit" className="twin__send" disabled={busy || !input.trim()} aria-label="Send">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M7 13V1M2 6l5-5 5 5" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          </button>
        </form>
        <p className="twin__disclaimer mono">
          AI-generated · may be imperfect · sent to third-party AI providers, so please don&apos;t share personal info
        </p>
      </section>
    </>
  );
}

export function AskTwinButton({ className = "btn btn--ghost" }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_TWIN_EVENT))}>
      <span className="pulse" aria-hidden /> Ask my AI twin
    </button>
  );
}

/* Minimal, safe markdown: paragraphs, "-"/"*" bullets, **bold**, links and emails. */
function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={`ul${blocks.length}`}>
          {bullets.map((b, i) => (
            <li key={i}>{inline(b)}</li>
          ))}
        </ul>
      );
      bullets = [];
    }
  };
  text.split("\n").forEach((raw) => {
    const line = raw.trim();
    const bullet = line.match(/^(?:[-*•]|\d+\.)\s+(.*)/);
    if (bullet) return void bullets.push(bullet[1]);
    flush();
    if (line) blocks.push(<p key={`p${blocks.length}`}>{inline(line)}</p>);
  });
  flush();
  return <>{blocks}</>;
}

function inline(s: string): ReactNode[] {
  const re = /(\*\*[^*]+\*\*|https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+)/g;
  return s.split(re).map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^https?:\/\//.test(part))
      return (
        <a key={i} href={part} target="_blank" rel="noreferrer">
          {part.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
        </a>
      );
    if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(part))
      return (
        <a key={i} href={`mailto:${part}`}>
          {part}
        </a>
      );
    return <Fragment key={i}>{part.replace(/\*(\S[^*]*)\*/g, "$1")}</Fragment>;
  });
}
