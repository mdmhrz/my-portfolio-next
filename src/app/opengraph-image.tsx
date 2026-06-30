import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const alt = "Mobarak Hossain Razu — Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  const photoData = readFileSync(join(process.cwd(), "public/mobarak-hossain.png"));
  const photoSrc = `data:image/png;base64,${photoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f8fafc",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        {/* ── Left: Text content (65%) ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 56px",
            position: "relative",
          }}
        >
          {/* Top brand row: avatar + name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 36,
            }}
          >
            <img
              src={photoSrc}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                objectFit: "cover",
                objectPosition: "center top",
                border: "2px solid #e2e8f0",
              }}
            />
            <span
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: "#374151",
                letterSpacing: "0.2px",
              }}
            >
              mhrazu.com
            </span>
          </div>

          {/* Role badge */}
          <div
            style={{
              display: "flex",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: "#2563eb",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 9999,
                padding: "6px 20px",
                display: "flex",
                letterSpacing: "0.3px",
              }}
            >
              Available for Hire
            </div>
          </div>

          {/* Main heading */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-2px",
              lineHeight: 1.1,
              display: "flex",
              flexDirection: "column",
              marginBottom: 24,
            }}
          >
            <span>Mobarak Hossain</span>
            <span>Full-Stack Developer</span>
          </div>

          {/* What I do */}
          <div
            style={{
              fontSize: 20,
              color: "#64748b",
              lineHeight: 1.6,
              display: "flex",
              maxWidth: 500,
              marginBottom: 44,
            }}
          >
            I design, build, and ship full-stack web apps — turning ideas into fast, scalable products that work beautifully.
          </div>

          {/* CTA button */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 600,
                color: "#ffffff",
                background: "#0f172a",
                borderRadius: 8,
                padding: "13px 28px",
                display: "flex",
                letterSpacing: "0.2px",
              }}
            >
              View Portfolio →
            </div>
            <span
              style={{
                fontSize: 15,
                color: "#94a3b8",
                display: "flex",
              }}
            >
              mhrazu.com
            </span>
          </div>
        </div>

        {/* ── Right: Full-height photo (35%) ── */}
        <div
          style={{
            width: 420,
            height: 630,
            flexShrink: 0,
            display: "flex",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <img
            src={photoSrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
            }}
          />
          {/* Subtle left fade into background */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 80,
              height: "100%",
              background: "linear-gradient(to right, #f8fafc, transparent)",
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
