import type { ReactNode } from 'react';

// Splits text into `.hero-char` spans for character-level animation, grouping
// each word in its own `whitespace-nowrap` wrapper so line-wrapping only ever
// happens BETWEEN words, never inside one. Splitting every character into its
// own inline-block loses the word as an atomic unit for the browser's line
// breaking — without the wrapper (and a real space as a sibling, not nested
// inside it), long words can break mid-word.
export function splitWords(text: string): ReactNode[] {
  const words = text.split(' ');
  const nodes: ReactNode[] = [];
  words.forEach((word, wi) => {
    nodes.push(
      <span key={`w-${wi}`} className="word-wrapper inline-block whitespace-nowrap">
        {word.split('').map((char, ci) => (
          <span key={ci} className="inline-block hero-char">
            {char}
          </span>
        ))}
      </span>,
    );
    if (wi < words.length - 1) nodes.push(' ');
  });
  return nodes;
}
