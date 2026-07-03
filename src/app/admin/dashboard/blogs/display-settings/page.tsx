import { prisma } from "@/lib/prisma";
import { BlogDisplaySettings } from "../_components/BlogDisplaySettings";
import { FormPageSkeleton } from "@/components/admin/FormPageSkeleton";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

/**
 * Lets the admin toggle the homepage "Featured Articles" slider, customize its
 * copy, and pick a card template with a live preview. Lives under Blog because
 * it configures blog display — not because it edits the homepage itself.
 *
 * The sample blog used for the live preview is the most recent published+featured
 * post (falling back to any published post) so the admin compares templates
 * against real content. Settings themselves are loaded client-side via the store
 * (same flow as the Settings page).
 */
export default async function BlogDisplaySettingsPage() {
  // Prefer a featured post for the preview; otherwise show the latest published one.
  const sampleBlog = await prisma.blog.findFirst({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      coverImageAlt: true,
      category: true,
      tags: true,
      featured: true,
      readingTime: true,
      views: true,
      createdAt: true,
    },
  });

  const serializedSample = sampleBlog
    ? { ...sampleBlog, createdAt: sampleBlog.createdAt.toISOString() }
    : null;

  return (
    <div className="max-w-5xl space-y-6">
      <Suspense fallback={<FormPageSkeleton fields={2} hasGridRow={false} />}>
        <BlogDisplaySettings sampleBlog={serializedSample} />
      </Suspense>
    </div>
  );
}
