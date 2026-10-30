import { ImageResponse } from "next/og";
import { profile, yearsExperience } from "@/lib/data";

/* The preview card shown when the site is shared on LinkedIn, Slack, X and so on. */
export const alt = "Alwin Rivera — Front-End Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#07080a";
const TEXT = "#eeeef0";
const MUTED = "#8b9099";
const ACCENT = "#d4ff3a";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: `radial-gradient(800px 420px at 85% 0%, rgba(212,255,58,0.16), transparent), radial-gradient(700px 400px at 0% 100%, rgba(139,123,255,0.14), transparent), ${BG}`,
        color: TEXT,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: 16,
            background: ACCENT,
            color: BG,
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          AR
        </div>
        <div style={{ fontSize: 30, fontWeight: 600 }}>{profile.name}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 1 }}>Front-end built to</div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 1.1 }}>
          enterprise standards<span style={{ color: ACCENT }}>.</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: MUTED }}>
        <span>
          {profile.role} · {yearsExperience}+ years · {profile.location}
        </span>
        <span style={{ color: ACCENT }}>With an edge.</span>
      </div>
    </div>,
    size
  );
}
