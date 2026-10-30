import {
  profile,
  stats,
  pillars,
  principles,
  skills,
  career,
  education,
  projects,
  profiles,
} from "@/lib/data";
import { Nav, Reveal, LocalClock, CopyEmail, Spotlight, Arrow } from "@/components/client";
import { TwinChat, AskTwinButton } from "@/components/twin-chat";

export default function Home() {
  return (
    <>
      <div className="progress" aria-hidden />
      <div className="backdrop" aria-hidden>
        <div className="backdrop__grid" />
        <div className="backdrop__glow" />
        <div className="backdrop__noise" />
      </div>

      <Nav />

      <main id="top">
        <Hero />
        <Marquee />
        <About />
        <Journey />
        <Work />
        <Contact />
      </main>

      <Footer />
      <TwinChat />
    </>
  );
}

/* ───────────────────────── Hero ───────────────────────── */

function Hero() {
  return (
    <section className="hero container">
      <div className="hero__meta mono">
        <span className="pill">
          <span className="pulse" aria-hidden />
          Open to select engagements
        </span>
        <span className="hero__meta-loc">
          {profile.location} · <LocalClock timeZone={profile.timezone} /> UTC+8
        </span>
      </div>

      <h1 className="hero__title">
            <span className="line">
              <span>Front-end</span>
            </span>
            <span className="line">
              <span>
                built to <em className="serif">enterprise</em>
              </span>
            </span>
            <span className="line">
              <span>
                standards<span className="accent">.</span>{" "}
                <span className="hero__edge">With an edge.</span>
              </span>
            </span>
          </h1>

      <div className="hero__grid">
        <div>
          <p className="hero__lede">
            I&apos;m <strong>Alwin Rivera</strong> — a front-end developer with 7+ years turning complex designs into
            fast, accessible, pixel-perfect interfaces that convert.
          </p>

          <div className="hero__ctas">
            <a href="#journey" className="btn btn--accent">
              View my journey <Arrow />
            </a>
            <AskTwinButton />
          </div>
        </div>

        <CodeCard />
      </div>

      <dl className="stats">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 80} className="stat">
            <dt className="stat__value">{s.value}</dt>
            <dd className="stat__label">{s.label}</dd>
          </Reveal>
        ))}
      </dl>
    </section>
  );
}

function CodeCard() {
  return (
    <div className="code" aria-label="Build specification">
      <div className="code__bar">
        <span className="code__dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="mono code__file">build.spec.ts</span>
        <span className="mono code__status">● live</span>
      </div>
      <pre className="code__body mono">
        <code>
          <span className="c">{"// the bar every release clears"}</span>
          {"\n"}
          <span className="k">export const</span> <span className="v">alwin</span> = {"{"}
          {"\n  "}role: <span className="s">&quot;Front-End Developer&quot;</span>,
          {"\n  "}since: <span className="n">2019</span>,
          {"\n  "}approach: <span className="s">&quot;mobile-first&quot;</span>,
          {"\n  "}a11y: <span className="s">&quot;WCAG AA&quot;</span>,
          {"\n  "}vitals: {"{ "}lcp: <span className="s">&quot;&lt;2.5s&quot;</span>, cls:{" "}
          <span className="s">&quot;&lt;0.1&quot;</span>
          {" }"},
          {"\n  "}browsers: <span className="s">&quot;every modern one&quot;</span>,
          {"\n  "}pixels: <span className="k">&quot;perfect&quot;</span>,
          {"\n"}
          {"}"}
          <span className="caret" aria-hidden />
        </code>
      </pre>
      <div className="code__foot mono">
        <span>
          <b>✓</b> responsive
        </span>
        <span>
          <b>✓</b> accessible
        </span>
        <span>
          <b>✓</b> optimized
        </span>
      </div>
    </div>
  );
}

/* ───────────────────────── Marquee ───────────────────────── */

function Marquee() {
  const row = [...skills, ...skills];
  return (
    <div className="marquee" aria-label="Core skills">
      <div className="marquee__track">
        {row.map((s, i) => (
          <span key={i} className="marquee__item" aria-hidden={i >= skills.length}>
            {s}
            <span className="marquee__sep">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Section header ───────────────────────── */

function SectionHead({ n, label, title, children }: { n: string; label: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <Reveal className="shead">
      <div className="shead__label mono">
        <span className="accent">{n}</span>
        <span className="shead__rule" />
        {label}
      </div>
      <h2 className="shead__title">{title}</h2>
      {children && <p className="shead__sub">{children}</p>}
    </Reveal>
  );
}

/* ───────────────────────── About ───────────────────────── */

function About() {
  return (
    <section id="about" className="section container">
      <SectionHead
        n="01"
        label="About"
        title={
          <>
            I bridge the gap between <em className="serif">design</em> and <em className="serif">function</em>.
          </>
        }
      />

      <div className="pillars">
        {pillars.map((p, i) => (
          <Reveal key={p.kicker} delay={i * 100} className="pillar">
            <div className="pillar__kicker mono">{p.kicker}</div>
            <h3 className="pillar__title">{p.title}</h3>
            <p className="pillar__body">{p.body}</p>
          </Reveal>
        ))}
      </div>

      <Spotlight className="principles">
        {principles.map((p, i) => (
          <Reveal key={p.id} delay={i * 80} className="principle" as="article">
            <div data-spot className="principle__inner">
              <span className="principle__id mono">{p.id}</span>
              <h3 className="principle__title">{p.title}</h3>
              <p className="principle__body">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </Spotlight>
    </section>
  );
}

/* ───────────────────────── Journey ───────────────────────── */

function Journey() {
  return (
    <section id="journey" className="section container">
      <SectionHead
        n="02"
        label="Career journey"
        title={
          <>
            Seven years. <em className="serif">One standard.</em>
          </>
        }
      >
        From junior developer to front-end analyst — every role sharpened the same craft: shipping interfaces that are
        fast, accessible and exactly as designed.
      </SectionHead>

      <ol className="timeline">
        {career.map((c, i) => (
          <Reveal as="li" key={c.company} delay={i * 60} className={`tl ${c.current ? "tl--current" : ""}`}>
            <div className="tl__aside">
              <span className="tl__span mono">{c.span}</span>
              {c.current && <span className="tag tag--accent mono">Current</span>}
            </div>

            <div className="tl__node" aria-hidden />

            <div className="tl__card">
              <header className="tl__head">
                <h3 className="tl__company">{c.company}</h3>
                <span className="tl__loc mono">{c.location}</span>
              </header>

              {c.roles.map((r) => (
                <div key={r.title + r.period} className="role">
                  <div className="role__head">
                    <h4 className="role__title">{r.title}</h4>
                    <span className="role__period mono">
                      {r.period} <span className="role__dur">· {r.duration}</span>
                    </span>
                  </div>
                  <ul className="role__list">
                    {r.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="tl__tags">
                {c.tags.map((t) => (
                  <span key={t} className="tag mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}

        <Reveal as="li" className="tl tl--edu">
          <div className="tl__aside">
            <span className="tl__span mono">{education.period}</span>
          </div>
          <div className="tl__node" aria-hidden />
          <div className="tl__card tl__card--edu">
            <span className="mono tl__eduLabel">Education</span>
            <h3 className="tl__company">{education.school}</h3>
            <p className="tl__degree">{education.degree}</p>
          </div>
        </Reveal>
      </ol>
    </section>
  );
}

/* ───────────────────────── Work ───────────────────────── */

function Work() {
  return (
    <section id="work" className="section container">
      <SectionHead
        n="03"
        label="Selected work"
        title={
          <>
            Case studies, <em className="serif">loading</em>
            <span className="blink accent">_</span>
          </>
        }
      >
        A curated portfolio is in production. In the meantime, explore the code, experiments and earlier work below.
      </SectionHead>

      <Spotlight className="projects">
        {projects.map((p, i) => {
          const live = p.status === "live" && p.href;
          const Inner = (
            <div data-spot className="project__inner">
              <div className="project__top mono">
                <span>{p.id}</span>
                <span className={`project__status ${live ? "is-live" : ""}`}>{live ? "Live" : "In production"}</span>
              </div>
              <div className="project__visual" aria-hidden>
                <span className="project__glyph">{p.id.split("/")[1]}</span>
              </div>
              <div className="project__cat mono">{p.category}</div>
              <h3 className="project__title">{p.title}</h3>
              <p className="project__blurb">{p.blurb}</p>
              <span className="project__cta mono">
                {live ? "View case study" : "Coming soon"} <Arrow diag={!!live} />
              </span>
            </div>
          );
          return (
            <Reveal key={p.id} delay={i * 90} className={`project ${live ? "" : "project--soon"}`} as="article">
              {live ? (
                <a href={p.href} target="_blank" rel="noreferrer" className="project__link">
                  {Inner}
                </a>
              ) : (
                Inner
              )}
            </Reveal>
          );
        })}
      </Spotlight>

      <Reveal className="profiles">
        {profiles.map((p) => (
          <a key={p.label} href={p.href} target="_blank" rel="noreferrer" className="profile">
            <span className="profile__label">{p.label}</span>
            <span className="profile__handle mono">{p.handle}</span>
            <span className="profile__note">{p.note}</span>
            <span className="profile__arrow">
              <Arrow diag />
            </span>
          </a>
        ))}
      </Reveal>
    </section>
  );
}

/* ───────────────────────── Contact ───────────────────────── */

function Contact() {
  return (
    <section id="contact" className="section container">
      <Reveal className="contact">
        <div className="contact__label mono">
          <span className="accent">04</span>
          <span className="shead__rule" />
          Contact
        </div>
        <h2 className="contact__title">
          Have a page that needs to <em className="serif">perform?</em>
          <br />
          <span className="contact__dim">Let&apos;s build it sharp.</span>
        </h2>
        <a href={`mailto:${profile.email}`} className="contact__email">
          {profile.email}
          <Arrow />
        </a>
        <div className="contact__actions">
          <a href={`mailto:${profile.email}`} className="btn btn--accent">
            Start a conversation <Arrow />
          </a>
          <CopyEmail email={profile.email} />
          <AskTwinButton />
        </div>
      </Reveal>
    </section>
  );
}

/* ───────────────────────── Footer ───────────────────────── */

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__wordmark" aria-hidden>
          {profile.firstName}
          <span className="accent">/</span>
          {profile.lastName}
        </div>
        <div className="footer__row mono">
          <span>© {new Date().getFullYear()} Alwin Rivera · Built with Next.js</span>
          <nav className="footer__links" aria-label="Social">
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={profile.links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={profile.links.codepen} target="_blank" rel="noreferrer">
              CodePen
            </a>
            <a href="#top">Back to top ↑</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
