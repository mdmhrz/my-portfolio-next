import OpenAI from "openai";

const SYSTEM_PROMPT = `You extract structured data from a pasted job posting.

Return ONLY a raw JSON object (no markdown code fences, no commentary) with exactly these keys, using null for anything not literally present in the text — never guess or invent a value:
{
  "company": string | null,
  "position": string | null,
  "location": string | null,
  "salaryMin": number | null,
  "salaryMax": number | null,
  "salaryCurrency": string | null,
  "workMode": "remote" | "hybrid" | "onsite" | null,
  "jobUrl": string | null,
  "notes": string | null
}

"notes" should be a 2-4 sentence summary of the key requirements and responsibilities, written for someone tracking their own job application (not a restatement of the whole posting). "jobUrl" should only be filled if a URL is literally present in the pasted text.`;

// Free OpenRouter models tried in order — skips to the next on rate-limit /
// no-endpoints / spend-limit, since availability varies per model.
const FREE_MODELS = [
  "openai/gpt-oss-20b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "google/gemma-3-12b-it:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "nvidia/nemotron-nano-9b-v2:free",
  "google/gemma-3-27b-it:free",
];

export interface JobDescriptionDraft {
  company: string | null;
  position: string | null;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  workMode: "remote" | "hybrid" | "onsite" | null;
  jobUrl: string | null;
  notes: string | null;
}

const WORK_MODES = new Set(["remote", "hybrid", "onsite"]);

function extractDraft(raw: string): JobDescriptionDraft {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const parsed = JSON.parse(cleaned);

  return {
    company: typeof parsed.company === "string" ? parsed.company : null,
    position: typeof parsed.position === "string" ? parsed.position : null,
    location: typeof parsed.location === "string" ? parsed.location : null,
    salaryMin: typeof parsed.salaryMin === "number" ? parsed.salaryMin : null,
    salaryMax: typeof parsed.salaryMax === "number" ? parsed.salaryMax : null,
    salaryCurrency: typeof parsed.salaryCurrency === "string" ? parsed.salaryCurrency : null,
    workMode: WORK_MODES.has(parsed.workMode) ? parsed.workMode : null,
    jobUrl: typeof parsed.jobUrl === "string" ? parsed.jobUrl : null,
    notes: typeof parsed.notes === "string" ? parsed.notes : null,
  };
}

export async function parseJobDescription(description: string): Promise<JobDescriptionDraft> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("AI parsing isn't configured (OPENROUTER_API_KEY missing).");
  }

  const client = new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.BETTER_AUTH_URL || "https://mhrazu.com",
      "X-Title": "mhrazu.com Job Tracker",
    },
  });

  let lastError: unknown;

  for (const model of FREE_MODELS) {
    try {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: description },
        ],
        max_tokens: 500,
        temperature: 0.2,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response from model");
      return extractDraft(content);
    } catch (error) {
      const statusCode = (error as { status?: number })?.status ?? 0;
      const message = error instanceof Error ? error.message : String(error);

      if (statusCode === 401 || message.includes("No auth") || message.includes("invalid_api_key")) {
        throw new Error("AI parsing is temporarily unavailable (auth error).");
      }

      // Rate-limited, no endpoints, spend limit, or a malformed response —
      // all worth trying the next model for rather than failing outright.
      console.warn(`[job-jd-parser] model ${model} failed: ${message}`);
      lastError = error;
    }
  }

  console.error("[job-jd-parser] all free models failed:", lastError);
  throw new Error("AI parsing is currently unavailable — try again in a few minutes.");
}
