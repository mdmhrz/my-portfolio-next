'use client';

import { useEffect, useRef, useState } from 'react';

const STACK = ['next.js', 'node.js', 'typescript', 'postgres', 'docker', 'aws'];

// Small typewriter that cycles the dev stack, with a blinking caret.
export function Terminal() {
  const [text, setText] = useState('');
  const [idx, setIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const word = STACK[idx % STACK.length];
    const atEnd = !deleting && text === word;
    const atStart = deleting && text === '';

    let delay = deleting ? 45 : 90;
    if (atEnd) delay = 1400;
    if (atStart) delay = 250;

    timeout.current = setTimeout(() => {
      if (atEnd) {
        setDeleting(true);
      } else if (atStart) {
        setDeleting(false);
        setIdx((i) => i + 1);
      } else {
        setText((cur) =>
          deleting ? word.slice(0, cur.length - 1) : word.slice(0, cur.length + 1),
        );
      }
    }, delay);

    return () => clearTimeout(timeout.current);
  }, [text, deleting, idx]);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 font-mono text-[11px] tracking-wide text-muted-foreground backdrop-blur">
      <span className="text-foreground/80">$</span>
      <span className="text-foreground">{text}</span>
      <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-foreground/70" />
      <span className="text-muted-foreground/60">// stack</span>
    </div>
  );
}
