import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/auth-helpers";
import { slugify } from "@/lib/utils";
import { blogRepo } from "@/modules/portfolio/blog/queries";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // ── Detect update mode ───────────────────────────────────────────────────
    // A *partial* update (e.g. toggling featured from the blog list) sends only
    // the fields that changed. A *full* update (from the blog editor) always
    // includes `title`. We build the Prisma `data` object accordingly so we
    // never call slugify(undefined) or overwrite unrelated fields with defaults.
    const isFullUpdate = typeof body.title === "string";

    if (isFullUpdate && !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: "Title is required." },
        { status: 422 }
      );
    }

    // Build the data object — only include fields that are actually present.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {};

    if (isFullUpdate) {
      const content: string = body.content || "";
      const readingTime = Math.max(
        1,
        Math.ceil(content.split(/\s+/).filter(Boolean).length / 200)
      );

      data.title = body.title.trim();
      data.slug = slugify(body.slug?.trim() || body.title);
      data.content = content;
      data.excerpt = body.excerpt || "";
      data.coverImage = body.coverImage || null;
      data.coverImageAlt = body.coverImageAlt || null;
      data.category = body.category || null;
      data.tags = Array.isArray(body.tags) ? body.tags : [];
      data.readingTime = readingTime;
      data.metaTitle = body.metaTitle || null;
      data.metaDescription = body.metaDescription || null;
    }

    // These flags are always safe to patch individually.
    if (typeof body.featured === "boolean") data.featured = body.featured;
    if (typeof body.published === "boolean") data.published = body.published;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields provided to update." },
        { status: 422 }
      );
    }

    const blog = await blogRepo.update(id, data);

    revalidatePath(`/blogs/${blog.slug}`);
    revalidatePath("/blogs");
    revalidatePath("/");
    revalidatePath("/sitemap.xml");

    return NextResponse.json({ success: true, data: blog });
  } catch (error: unknown) {
    // Prisma P2025 → record not found
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { success: false, error: "Blog post not found." },
        { status: 404 }
      );
    }

    // Prisma P2002 → unique constraint (slug already taken)
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "A post with this slug already exists. Please choose a different title or slug." },
        { status: 409 }
      );
    }

    console.error("PUT /api/admin/blogs/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong while saving the post. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await blogRepo.remove(id);

    revalidatePath("/blogs");
    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("DELETE blog error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete blog" }, { status: 500 });
  }
}
