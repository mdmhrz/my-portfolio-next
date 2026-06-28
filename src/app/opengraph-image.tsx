import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const alt = "Mobarak Hossain Razu — Full-Stack Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  const svgRaw = readFileSync(join(process.cwd(), "public/razu-logo.svg"), "utf-8");
  const svgWhite = svgRaw.replace(/currentColor/g, "#ffffff");
  const logoSrc = `data:image/svg+xml;base64,${Buffer.from(svgWhite).toString("base64")}`;

  let fontData: ArrayBuffer | undefined;
  try {
    fontData = readFileSync(
      join(process.cwd(), "public/fonts/Satoshi-Bold.woff2")
    ).buffer as ArrayBuffer;
  } catch {
    // falls back to default sans-serif
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          fontFamily: fontData ? "Satoshi" : "sans-serif",
        }}
      >
        {/* Indigo radial glow */}
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 250,
            width: 700,
            height: 350,
            background:
              "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 72%)",
            display: "flex",
          }}
        />

        {/* Logo mark */}
        <img
          src={logoSrc}
          width={110}
          height={88}
          alt=""
          style={{ marginBottom: 32 }}
        />

        {/* Full name */}
        <div
          style={{
            fontSize: 54,
            fontWeight: 700,
            color: "#fafafa",
            letterSpacing: "-1.5px",
            display: "flex",
            marginBottom: 12,
          }}
        >
          Mobarak Hossain Razu
        </div>

        {/* Role line */}
        <div
          style={{
            fontSize: 20,
            color: "#71717a",
            letterSpacing: "3px",
            textTransform: "uppercase",
            display: "flex",
            marginBottom: 40,
          }}
        >
          Full-Stack Developer
        </div>

        {/* Tech badges */}
        <div style={{ display: "flex", gap: 10 }}>
          {["Next.js", "Go", "PostgreSQL", "Docker", "AWS"].map((tech) => (
            <div
              key={tech}
              style={{
                fontSize: 14,
                color: "#818cf8",
                background: "rgba(99,102,241,0.10)",
                border: "1px solid rgba(99,102,241,0.28)",
                borderRadius: 8,
                padding: "5px 16px",
                display: "flex",
              }}
            >
              {tech}
            </div>
          ))}
        </div>

        {/* Domain watermark */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            right: 52,
            fontSize: 15,
            color: "#3f3f46",
            display: "flex",
          }}
        >
          mhrazu.com
        </div>
      </div>
    ),
    {
      ...size,
      ...(fontData
        ? { fonts: [{ name: "Satoshi", data: fontData, style: "normal", weight: 700 }] }
        : {}),
    }
  );
}
