// Tiny first-party analytics client. Safe to call anywhere on public pages.

const VISITOR_KEY = "pf_visitor_id";

function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

export function track(type: "pageview" | "resume_download", path?: string) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({
    type,
    path: path ?? window.location.pathname,
    referrer: document.referrer || null,
    visitorId: getVisitorId(),
  });

  // sendBeacon survives page unload (e.g. clicking a download link); fall back to fetch.
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      return;
    }
  } catch {
    /* fall through */
  }
  fetch("/api/track", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
}
