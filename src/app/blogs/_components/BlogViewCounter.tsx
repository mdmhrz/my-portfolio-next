'use client';

import { useEffect } from "react";

interface BlogViewCounterProps {
  slug: string;
}

export function BlogViewCounter({ slug }: BlogViewCounterProps) {
  useEffect(() => {
    fetch(`/api/blogs/${slug}/views`, { method: 'POST' }).catch(() => {});
  // Intentionally runs only once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
