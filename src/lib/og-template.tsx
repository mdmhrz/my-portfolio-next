import { readFileSync } from "fs";
import { join } from "path";

interface OgTemplateProps {
  badge: string;
  heading: string;
  subheading: string;
  description: string;
  ctaLabel: string;
}

// Shared branded background for every route's opengraph-image.tsx — keeps
// social share cards visually consistent while letting each page swap in
// its own badge/heading/description text.
export function renderOgTemplate({ badge, heading, subheading, description, ctaLabel }: OgTemplateProps) {
  const photoData = readFileSync(join(process.cwd(), "public/mobarak-hossain.png"));
  const photoSrc = `data:image/png;base64,${photoData.toString("base64")}`;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#ffffff",
        fontFamily: "sans-serif",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── Decorative navy corner accent, top-left ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 0,
          height: 0,
          borderTop: "260px solid #0f172a",
          borderRight: "260px solid transparent",
          display: "flex",
        }}
      />

      {/* ── Decorative dot-grid texture, upper-right ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 616,
          height: 616,
          display: "flex",
          flexWrap: "wrap",
          alignContent: "flex-start",
        }}
      >
        {Array.from({ length: 22 * 22 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 3,
                height: 3,
                borderRadius: 999,
                background: "#e2e8f0",
                display: "flex",
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Framed photo card ── */}
      <div
        style={{
          position: "absolute",
          top: 84,
          left: 70,
          width: 300,
          height: 462,
          display: "flex",
          background: "#ffffff",
          borderRadius: 6,
          padding: 10,
          boxShadow: "0 24px 48px rgba(15, 23, 42, 0.22)",
        }}
      >
        <img
          src={photoSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            borderRadius: 2,
          }}
        />
      </div>

      {/* ── Right: Text content ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 430,
          width: 1200 - 430 - 56,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 56px 60px 0",
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
            {badge}
          </div>
        </div>

        {/* Main heading */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-2px",
              lineHeight: 1.1,
            }}
          >
            {heading}
          </span>
          <span
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: "#2563eb",
              letterSpacing: "-0.3px",
              lineHeight: 1.4,
              marginTop: 6,
            }}
          >
            {subheading}
          </span>
        </div>

        {/* Description */}
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
          {description}
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
            {ctaLabel}
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
    </div>
  );
}
