import { notFound } from "next/navigation";
import { blogRepo } from "@/modules/portfolio/blog/queries";
import { BlogEditor } from "@/modules/portfolio/blog/components/BlogEditor";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;
  const blog = await blogRepo.get(id);
  if (!blog) notFound();

  // Serialize dates for client boundary
  const serialized = {
    ...blog,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
    coverImage: blog.coverImage ?? '',
    coverImageAlt: blog.coverImageAlt ?? '',
    category: blog.category ?? '',
    tags: blog.tags ?? [],
    metaTitle: blog.metaTitle ?? '',
    metaDescription: blog.metaDescription ?? '',
  };

  return <BlogEditor initialData={serialized} />;
}
