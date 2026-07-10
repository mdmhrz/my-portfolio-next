import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdmin } from "@/lib/auth-helpers";
import { parseJobDescription } from "@/modules/jobs/service/jd-parser";

const bodySchema = z.object({
  description: z.string().trim().min(20, "Paste more of the job description"),
});

export async function POST(request: Request) {
  const admin = await verifyAdmin();
  if (!admin) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const draft = await parseJobDescription(parsed.data.description);
    return NextResponse.json({ success: true, data: draft });
  } catch (error) {
    console.error("POST jobs/parse-jd error:", error);
    const message = error instanceof Error ? error.message : "Failed to parse job description";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
