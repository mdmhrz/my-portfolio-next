import { Suspense } from "react";
import { blogRepo } from "@/modules/portfolio/blog/queries";
import { BlogsPageTabs } from "@/modules/portfolio/blog/components/BlogsPageTabs";
import { FormPageSkeleton } from "@/components/admin/FormPageSkeleton";

export const dynamic = "force-dynamic";

/**
 * Prefer a featured post for the Display Settings preview; otherwise show the
 * latest published one. Fetched here (not in the tab) so switching tabs is instant.
 */
export default async function BlogsPage() {
  const sampleBlog = await blogRepo.findFirstPublished([{ featured: "desc" }, { createdAt: "desc" }]);

  const serializedSample = sampleBlog
    ? { ...sampleBlog, createdAt: sampleBlog.createdAt.toISOString() }
    : null;

  return (
    <Suspense fallback={<FormPageSkeleton fields={4} hasGridRow />}>
      <BlogsPageTabs sampleBlog={serializedSample} />
    </Suspense>
  );
}
