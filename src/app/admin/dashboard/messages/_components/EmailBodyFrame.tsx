'use client';

import { useEffect, useRef, useState } from "react";

// Renders untrusted email HTML in a sandboxed iframe (no script execution)
// so inbound mail from external senders can never run JS in the admin dashboard.
// The iframe is style-isolated from the app, so we bridge the active theme tokens
// (--foreground / --muted-foreground / --info) in as inline values — keeping the
// body copy on-brand without hardcoding any colors.
export function EmailBodyFrame({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const resizeObs = useRef<ResizeObserver | null>(null);
  const [height, setHeight] = useState(24);
  const [tokens, setTokens] = useState({
    fg: "inherit",
    link: "inherit",
    border: "transparent",
  });

  // Grow the iframe to its full content height so a message never scrolls
  // internally. scrollHeight is re-read whenever the body resizes (late image
  // loads, web fonts, reflow) via a ResizeObserver living in the iframe's window.
  const syncHeight = () => {
    const iframe = ref.current;
    const win = iframe?.contentWindow as (Window & typeof globalThis) | null | undefined;
    const body = iframe?.contentDocument?.body;
    if (!body || !win) return;

    const measure = () =>
      setHeight(Math.max(body.scrollHeight, body.offsetHeight) + 4);
    measure();

    resizeObs.current?.disconnect();
    if (typeof win.ResizeObserver === "function") {
      resizeObs.current = new win.ResizeObserver(measure);
      resizeObs.current.observe(body);
    }
    // Images without explicit dimensions settle after load — re-measure then.
    body.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", measure, { once: true });
    });
  };

  useEffect(() => () => resizeObs.current?.disconnect(), []);

  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      const val = (name: string, fallback: string) =>
        cs.getPropertyValue(name).trim() || fallback;
      setTokens({
        fg: val("--foreground", "#111"),
        link: val("--info", val("--primary", "#2563eb")),
        border: val("--border", "transparent"),
      });
    };
    read();
    // Re-read when the theme (light/dark class on <html>) changes.
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const doc = `<!doctype html><html><head><base target="_blank"><meta name="color-scheme" content="light dark"><style>
    body { margin: 0; font: 13.5px/1.65 var(--font-app, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif); color: ${tokens.fg}; background: transparent; word-wrap: break-word; overflow-wrap: anywhere; }
    img { max-width: 100%; height: auto; border-radius: 6px; }
    a { color: ${tokens.link}; text-underline-offset: 2px; }
    p { margin: 0 0 0.75em; }
    blockquote { margin: 0.5em 0; padding-left: 0.9em; border-left: 2px solid ${tokens.border}; opacity: 0.8; }
    pre, code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  </style></head><body>${html}</body></html>`;

  return (
    <iframe
      ref={ref}
      srcDoc={doc}
      sandbox="allow-same-origin allow-popups"
      style={{ width: "100%", height, border: "none", display: "block" }}
      scrolling="no"
      onLoad={syncHeight}
    />
  );
}
