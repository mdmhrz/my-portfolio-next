/**
 * Lightweight blog shape used by public-facing cards (listing + homepage slider).
 * Mirrors the `select` projection used in `src/app/blogs/page.tsx` and the
 * homepage featured-blog query in `src/app/page.tsx`. Kept separate from the
 * full `BlogData` (store) type so cards don't carry heavy fields like `content`.
 */
export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  coverImageAlt: string | null;
  category: string | null;
  tags: string[];
  featured: boolean;
  readingTime: number;
  views: number;
  createdAt: string;
}
