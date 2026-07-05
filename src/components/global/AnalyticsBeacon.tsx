'use client';

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";

// Records a first-party pageview on every public route change. Admin routes are
// skipped here and also rejected server-side as a safety net.
export function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    track("pageview", pathname);
  }, [pathname]);

  return null;
}
