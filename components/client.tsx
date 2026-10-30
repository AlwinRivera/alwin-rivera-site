"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

/* Fades + lifts children into view once, when scrolled to. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${shown ? "is-in" : ""} ${className}`}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

const NAV = [
  { href: "#about", label: "About", n: "01" },
  { href: "#journey", label: "Journey", n: "02" },
  { href: "#work", label: "Work", n: "03" },
  { href: "#contact", label: "Contact", n: "04" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const sections = NAV.map((n) => document.querySelector(n.href)).filter(Boolean) as Element[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  // The menu is hidden by CSS above the mobile breakpoint, so close it there (and on Escape)
  // rather than leave the page scroll-locked with no visible way out.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 861px)");
    const onResize = () => mq.matches && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header
      className={`nav ${scrolled ? "nav--scrolled" : ""} ${open ? "nav--open" : ""}`}
      onClick={(e) => {
        // Tapping the scrim (the header's own ::before) closes the menu.
        if (open && e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="nav__inner">
        <a href="#top" className="brand" aria-label="Alwin Rivera — home" onClick={() => setOpen(false)}>
          <span className="brand__mark" aria-hidden>
            AR
          </span>
          <span className="brand__name">
            Alwin Rivera<span className="brand__dot">.</span>
          </span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          {NAV.map((item) => (
            <a key={item.href} href={item.href} className={active === item.href ? "is-active" : ""}>
              <span className="nav__n">{item.n}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <a href="#contact" className="btn btn--sm btn--accent nav__cta">
          Let&apos;s talk
          <Arrow />
        </a>

        <button
          className="nav__toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </div>

      <div className="nav__sheet" aria-hidden={!open}>
        {NAV.map((item, i) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
            tabIndex={open ? 0 : -1}
          >
            <span className="nav__n">{item.n}</span>
            {item.label}
          </a>
        ))}
        <a
          href="#contact"
          className="btn btn--accent nav__sheet-cta"
          onClick={() => setOpen(false)}
          style={{ transitionDelay: open ? "300ms" : "0ms" }}
          tabIndex={open ? 0 : -1}
        >
          Let&apos;s talk <Arrow />
        </a>
      </div>
    </header>
  );
}

export function LocalClock({ timeZone }: { timeZone: string }) {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timeZone]);
  return <span suppressHydrationWarning>{time || "--:--:--"}</span>;
}

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn btn--ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          window.location.href = `mailto:${email}`;
        }
      }}
    >
      {copied ? "Copied to clipboard ✓" : "Copy email"}
    </button>
  );
}

/* Tracks the pointer across a grid of cards so each can render a spotlight. */
export function Spotlight({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={className}
      onPointerMove={(e) => {
        const cards = ref.current?.querySelectorAll<HTMLElement>("[data-spot]");
        cards?.forEach((c) => {
          const r = c.getBoundingClientRect();
          c.style.setProperty("--mx", `${e.clientX - r.left}px`);
          c.style.setProperty("--my", `${e.clientY - r.top}px`);
        });
      }}
    >
      {children}
    </div>
  );
}

export function Arrow({ diag = false }: { diag?: boolean }) {
  return (
    <svg
      className={`arrow ${diag ? "arrow--diag" : ""}`}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
    >
      <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}
