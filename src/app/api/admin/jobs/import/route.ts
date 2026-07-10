import { NextResponse } from "next/server";
import { z } from "zod";
import { jobsRepo } from "@/modules/jobs/queries";
import {
  JOB_SOURCES,
  JOB_APPLICATION_TYPES,
  JOB_WORK_MODES,
} from "@/modules/jobs/components/job-constants";

// Only admin route reachable from outside the session-authed dashboard UI
// (the browser extension, Phase 5), so unlike every other /api/admin/* route
// it validates its input instead of trusting the caller.
const importSchema = z.object({
  company: z.string().trim().min(1),
  position: z.string().trim().min(1),
  companyLogo: z.string().trim().min(1).optional(),
  jobUrl: z.string().trim().min(1).optional(),
  source: z.enum(JOB_SOURCES.map((s) => s.value) as [string, ...string[]]).optional(),
  applicationType: z
    .enum(JOB_APPLICATION_TYPES.map((t) => t.value) as [string, ...string[]])
    .optional(),
  location: z.string().trim().min(1).optional(),
  workMode: z.enum(JOB_WORK_MODES.map((m) => m.value) as [string, ...string[]]).optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.string().trim().min(1).optional(),
});

// This route's trust boundary is the bearer token, not the caller's origin —
// the whole point of Phase 5 is that a browser extension can't carry the
// admin session cookie. So it answers CORS openly rather than trying to
// whitelist a chrome-extension:// origin (which differs per install).
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, { ...init, headers: { ...CORS_HEADERS, ...init?.headers } });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  const expected = process.env.JOB_IMPORT_TOKEN;
  const authHeader = request.headers.get("authorization");
  if (!expected || authHeader !== `Bearer ${expected}`) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const parsed = importSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return json(
      { success: false, error: "Invalid job data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const body = parsed.data;

  try {
    if (body.jobUrl) {
      const existing = await jobsRepo.findByJobUrl(body.jobUrl);
      if (existing) {
        return json({ success: true, data: existing, duplicate: true });
      }
    }

    const job = await jobsRepo.create({
      company: body.company,
      position: body.position,
      companyLogo: body.companyLogo || null,
      jobUrl: body.jobUrl || null,
      source: body.source || "career_site",
      applicationType: body.applicationType || "external_website",
      status: "found",
      salaryMin: body.salaryMin ?? null,
      salaryMax: body.salaryMax ?? null,
      salaryCurrency: body.salaryCurrency || null,
      location: body.location || null,
      workMode: body.workMode || null,
      order: await jobsRepo.count(),
      events: { create: { status: "found", source: "extension" } },
    });

    return json({ success: true, data: job, duplicate: false });
  } catch (error) {
    console.error("POST jobs/import error:", error);
    return json({ success: false, error: "Failed to import job" }, { status: 500 });
  }
}
