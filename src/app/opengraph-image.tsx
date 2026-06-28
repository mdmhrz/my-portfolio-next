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
          background: "#09090b",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        {/* ── Left: Photo panel ── */}
        <div
          style={{
            width: 440,
            height: 630,
            flexShrink: 0,
            display: "flex",
            position: "relative",
            backgroundImage: `url(${photoSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        >
          {/* Gradient: right edge fades into background */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 160,
              height: "100%",
              background: "linear-gradient(to right, transparent, #09090b)",
              display: "flex",
            }}
          />
          {/* Gradient: bottom edge */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: 100,
              background: "linear-gradient(to bottom, transparent, #09090b)",
              display: "flex",
            }}
          />
        </div>

        {/* ── Right: Text content ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: 48,
            paddingRight: 72,
            position: "relative",
          }}
        >
          {/* Indigo radial glow */}
          <div
            style={{
              position: "absolute",
              top: 60,
              right: 40,
              width: 480,
              height: 300,
              background:
                "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)",
              display: "flex",
            }}
          />

          {/* Name */}
          <div
            style={{
              fontSize: 50,
              fontWeight: 700,
              color: "#fafafa",
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
              display: "flex",
              marginBottom: 20,
            }}
          >
            Mobarak Hossain Razu
          </div>

          {/* Role badges */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 28,
            }}
          >
            {["Frontend Developer", "Full-Stack Engineer"].map((role) => (
              <div
                key={role}
                style={{
                  fontSize: 15,
                  color: "#818cf8",
                  background: "rgba(99,102,241,0.10)",
                  border: "1px solid rgba(99,102,241,0.30)",
                  borderRadius: 6,
                  padding: "5px 16px",
                  display: "flex",
                  letterSpacing: "0.3px",
                }}
              >
                {role}
              </div>
            ))}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 22,
              color: "#71717a",
              lineHeight: 1.55,
              display: "flex",
              flexWrap: "wrap",
              maxWidth: 520,
              marginBottom: 44,
            }}
          >
            Building fast, scalable web applications with React, Next.js, Go & PostgreSQL.
          </div>

          {/* Domain */}
          <div
            style={{
              fontSize: 15,
              color: "#3f3f46",
              letterSpacing: "1px",
              display: "flex",
            }}
          >
            mhrazu.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
