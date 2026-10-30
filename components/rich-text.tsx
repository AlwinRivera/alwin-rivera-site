import { Fragment, type ReactNode } from "react";

/* Minimal, safe markdown: paragraphs, "-"/"*" bullets, "1." numbered lists, **bold**, links and emails. */
export function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let items: string[] = [];
  let ordered = false;
  const flush = () => {
    if (items.length) {
      const List = ordered ? "ol" : "ul";
      blocks.push(
        <List key={`list${blocks.length}`}>
          {items.map((b, i) => (
            <li key={i}>{inline(b)}</li>
          ))}
        </List>
      );
      items = [];
    }
  };
  text.split("\n").forEach((raw) => {
    const line = raw.trim();
    const item = line.match(/^(?:([-*•])|\d+\.)\s+(.*)/);
    if (item) {
      const isOrdered = !item[1];
      if (items.length && isOrdered !== ordered) flush();
      ordered = isOrdered;
      return void items.push(item[2]);
    }
    flush();
    if (line) blocks.push(<p key={`p${blocks.length}`}>{inline(line)}</p>);
  });
  flush();
  return <>{blocks}</>;
}

/* Sentence punctuation after a link ("email me at a@b.com.") belongs to the sentence, not the link. */
function splitTrailing(part: string) {
  const m = part.match(/^(.*?)([.,;:!?]+)$/);
  return m ? [m[1], m[2]] : [part, ""];
}

function inline(s: string): ReactNode[] {
  const re = /(\*\*[^*]+\*\*|https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]+)/g;
  return s.split(re).map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^https?:\/\//.test(part)) {
      const [url, trail] = splitTrailing(part);
      return (
        <Fragment key={i}>
          <a href={url} target="_blank" rel="noreferrer">
            {url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
          </a>
          {trail}
        </Fragment>
      );
    }
    if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(part)) {
      const [email, trail] = splitTrailing(part);
      return (
        <Fragment key={i}>
          <a href={`mailto:${email}`}>{email}</a>
          {trail}
        </Fragment>
      );
    }
    return <Fragment key={i}>{part.replace(/\*(\S[^*]*)\*/g, "$1")}</Fragment>;
  });
}
