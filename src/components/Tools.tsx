'use client';

import { useState, useRef, useEffect } from "react";
import { Reveal } from "@/components/Reveal";
import { 
  Code2, 
  Layout, 
  Server, 
  Database, 
  ShieldCheck, 
  CreditCard, 
  Cloud, 
  Terminal,
  FileCode2,
  TerminalSquare
} from "lucide-react";

interface CodeToken {
  text: string;
  color?: string; // CSS color classes
}

type CodeLine = CodeToken[];

interface TechItem {
  name: string;
  level: string;
  snippetKey: string;
}

interface Group {
  id: string;
  label: string;
  icon: typeof Code2;
  desc: string;
  items: TechItem[];
}

interface Snippet {
  filename: string;
  lang: string;
  lines: CodeLine[];
  terminal: string;
}

const snippets: Record<string, Snippet> = {
  typescript: {
    filename: "types.ts",
    lang: "TypeScript",
    lines: [
      [
        { text: "export ", color: "text-purple-400 font-semibold" },
        { text: "interface ", color: "text-blue-400 font-semibold" },
        { text: "Developer ", color: "text-yellow-400" },
        { text: "{" }
      ],
      [
        { text: "  name: " },
        { text: "string", color: "text-teal-400" },
        { text: ";" }
      ],
      [
        { text: "  skills: " },
        { text: "string", color: "text-teal-400" },
        { text: "[]" },
        { text: ";" }
      ],
      [
        { text: "  experience: " },
        { text: "number", color: "text-teal-400" },
        { text: ";" }
      ],
      [
        { text: "  builds: " },
        { text: "() => ", color: "text-purple-400" },
        { text: "Promise", color: "text-yellow-400" },
        { text: "<" },
        { text: "void", color: "text-teal-400" },
        { text: ">;" }
      ],
      [{ text: "}" }]
    ],
    terminal: "$ tsc --noEmit\n✓ Type-check completed successfully [0.12s]"
  },
  nextjs: {
    filename: "page.tsx",
    lang: "React / Next.js",
    lines: [
      [
        { text: "import ", color: "text-purple-400 font-semibold" },
        { text: "{ cache } ", color: "text-blue-400" },
        { text: "from ", color: "text-purple-400 font-semibold" },
        { text: "'react'" },
        { text: ";" }
      ],
      [
        { text: "import ", color: "text-purple-400 font-semibold" },
        { text: "db ", color: "text-blue-400" },
        { text: "from ", color: "text-purple-400 font-semibold" },
        { text: "'@/lib/db'" },
        { text: ";" }
      ],
      [],
      [
        { text: "export ", color: "text-purple-400 font-semibold" },
        { text: "default ", color: "text-purple-400 font-semibold" },
        { text: "async ", color: "text-purple-400 font-semibold" },
        { text: "function ", color: "text-purple-400 font-semibold" },
        { text: "Page", color: "text-yellow-400" },
        { text: "() {" }
      ],
      [
        { text: "  const ", color: "text-purple-400 font-semibold" },
        { text: "projects = " },
        { text: "await ", color: "text-purple-400 font-semibold" },
        { text: "db.select().from(projectsTable);" }
      ],
      [
        { text: "  return ", color: "text-purple-400 font-semibold" },
        { text: "<" },
        { text: "Showcase ", color: "text-yellow-400" },
        { text: "items={projects} />;" }
      ],
      [{ text: "}" }]
    ],
    terminal: "$ next build\n✓ Generating static HTML pages\n✓ Built route /portfolio [32ms]"
  },
  golang: {
    filename: "main.go",
    lang: "Go",
    lines: [
      [
        { text: "package ", color: "text-purple-400 font-semibold" },
        { text: "main" }
      ],
      [],
      [
        { text: "import ", color: "text-purple-400 font-semibold" },
        { text: "(" }
      ],
      [
        { text: "    \"net/http\"", color: "text-green-400" }
      ],
      [
        { text: "    \"github.com/labstack/echo/v4\"", color: "text-green-400" }
      ],
      [
        { text: ")" }
      ],
      [],
      [
        { text: "func ", color: "text-purple-400 font-semibold" },
        { text: "main", color: "text-yellow-400" },
        { text: "() {" }
      ],
      [
        { text: "    e := echo.New()" }
      ],
      [
        { text: "    e.GET(", color: "text-blue-400" },
        { text: "\"/health\"", color: "text-green-400" },
        { text: ", func(c echo.Context) error {" }
      ],
      [
        { text: "        return ", color: "text-purple-400 font-semibold" },
        { text: "c.JSON(http.StatusOK, map[string]string{\"status\": \"ok\"})" }
      ],
      [
        { text: "    })" }
      ],
      [
        { text: "    e.Logger.Fatal(e.Start(\":8080\"))" }
      ],
      [{ text: "}" }]
    ],
    terminal: "$ go run main.go\n⇨ http server started on [::]:8080"
  },
  postgresql: {
    filename: "schema.sql",
    lang: "SQL / PostgreSQL",
    lines: [
      [
        { text: "CREATE ", color: "text-purple-400 font-semibold" },
        { text: "TABLE ", color: "text-purple-400 font-semibold" },
        { text: "users ", color: "text-yellow-400" },
        { text: "(" }
      ],
      [
        { text: "  id ", color: "text-blue-400" },
        { text: "UUID ", color: "text-teal-400 font-semibold" },
        { text: "PRIMARY KEY DEFAULT ", color: "text-purple-400" },
        { text: "gen_random_uuid()" }
      ],
      [
        { text: "  email ", color: "text-blue-400" },
        { text: "VARCHAR(255) ", color: "text-teal-400 font-semibold" },
        { text: "UNIQUE NOT NULL", color: "text-purple-400" }
      ],
      [
        { text: "  created_at ", color: "text-blue-400" },
        { text: "TIMESTAMPTZ ", color: "text-teal-400 font-semibold" },
        { text: "DEFAULT ", color: "text-purple-400" },
        { text: "NOW()" }
      ],
      [{ text: ");" }],
      [],
      [
        { text: "CREATE ", color: "text-purple-400 font-semibold" },
        { text: "INDEX ", color: "text-purple-400 font-semibold" },
        { text: "idx_users_email " },
        { text: "ON ", color: "text-purple-400 font-semibold" },
        { text: "users(email);" }
      ]
    ],
    terminal: "$ psql -d production -f schema.sql\nCREATE TABLE ✓\nCREATE INDEX ✓"
  },
  auth: {
    filename: "auth.ts",
    lang: "Auth Systems",
    lines: [
      [
        { text: "import ", color: "text-purple-400 font-semibold" },
        { text: "{ betterAuth } ", color: "text-blue-400" },
        { text: "from ", color: "text-purple-400 font-semibold" },
        { text: "'better-auth'" },
        { text: ";" }
      ],
      [],
      [
        { text: "export ", color: "text-purple-400 font-semibold" },
        { text: "const ", color: "text-purple-400 font-semibold" },
        { text: "auth ", color: "text-blue-400" },
        { text: "= betterAuth({" }
      ],
      [
        { text: "  database: new PrismaClient(),", color: "text-muted-foreground/80" }
      ],
      [
        { text: "  socialProviders: {" },
      ],
      [
        { text: "    google: {" },
      ],
      [
        { text: "      clientId: process.env.GOOGLE_CLIENT_ID!,", color: "text-muted-foreground/80" }
      ],
      [
        { text: "      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,", color: "text-muted-foreground/80" }
      ],
      [
        { text: "    }" },
      ],
      [
        { text: "  }" },
      ],
      [{ text: "});" }]
    ],
    terminal: "$ node auth.js\nBetter-Auth Server initialized on port 3000..."
  },
  stripe: {
    filename: "stripe.ts",
    lang: "Stripe integration",
    lines: [
      [
        { text: "import ", color: "text-purple-400 font-semibold" },
        { text: "Stripe ", color: "text-yellow-400" },
        { text: "from ", color: "text-purple-400 font-semibold" },
        { text: "'stripe'" },
        { text: ";" }
      ],
      [],
      [
        { text: "const ", color: "text-purple-400 font-semibold" },
        { text: "stripe ", color: "text-blue-400" },
        { text: "= new Stripe(process.env.STRIPE_SECRET_KEY!, {" }
      ],
      [
        { text: "  apiVersion: '2023-10-16'," },
      ],
      [
        { text: "});" }
      ],
      [],
      [
        { text: "export ", color: "text-purple-400 font-semibold" },
        { text: "const ", color: "text-purple-400 font-semibold" },
        { text: "createSession ", color: "text-blue-400" },
        { text: "= " },
        { text: "async ", color: "text-purple-400 font-semibold" },
        { text: "(customerId: string) => {" }
      ],
      [
        { text: "  return await stripe.checkout.sessions.create({" }
      ],
      [
        { text: "    customer: customerId," }
      ],
      [
        { text: "    mode: 'subscription'," }
      ],
      [
        { text: "    payment_method_types: ['card']," }
      ],
      [
        { text: "  });" }
      ],
      [{ text: "};" }]
    ],
    terminal: "$ stripe listen\nReady! You are listening to Stripe events..."
  },
  docker: {
    filename: "Dockerfile",
    lang: "Docker configuration",
    lines: [
      [
        { text: "FROM ", color: "text-purple-400 font-semibold" },
        { text: "node:20-alpine " },
        { text: "AS ", color: "text-purple-400 font-semibold" },
        { text: "builder" }
      ],
      [
        { text: "WORKDIR ", color: "text-purple-400 font-semibold" },
        { text: "/app" }
      ],
      [
        { text: "COPY ", color: "text-purple-400 font-semibold" },
        { text: "package*.json ./" }
      ],
      [
        { text: "RUN ", color: "text-purple-400 font-semibold" },
        { text: "npm ci" }
      ],
      [
        { text: "COPY ", color: "text-purple-400 font-semibold" },
        { text: ". ." }
      ],
      [
        { text: "RUN ", color: "text-purple-400 font-semibold" },
        { text: "npm run build" }
      ],
      [],
      [
        { text: "FROM ", color: "text-purple-400 font-semibold" },
        { text: "node:20-alpine" }
      ],
      [
        { text: "CMD ", color: "text-purple-400 font-semibold" },
        { text: "[\"node\", \"dist/index.js\"]" }
      ]
    ],
    terminal: "$ docker build -t my-app .\n✓ Successfully built image [12.4s]"
  },
  git: {
    filename: "deploy.yml",
    lang: "CI / CD pipeline",
    lines: [
      [
        { text: "name: ", color: "text-blue-400" },
        { text: "Production CI/CD" }
      ],
      [
        { text: "on: ", color: "text-blue-400" },
        { text: "[push]" }
      ],
      [
        { text: "jobs: ", color: "text-blue-400" }
      ],
      [
        { text: "  deploy: " }
      ],
      [
        { text: "    runs-on: " },
        { text: "ubuntu-latest", color: "text-green-400" }
      ],
      [
        { text: "    steps: " }
      ],
      [
        { text: "      - name: " },
        { text: "Checkout code", color: "text-green-400" }
      ],
      [
        { text: "        uses: " },
        { text: "actions/checkout@v4" }
      ],
      [
        { text: "      - name: " },
        { text: "Build Docker Image", color: "text-green-400" }
      ],
      [
        { text: "        run: " },
        { text: "docker build -t app ." }
      ]
    ],
    terminal: "$ git push origin main\n✓ GitHub Action: Production Build Passed!"
  }
};

const groups: Group[] = [
  {
    id: "01",
    label: "Languages",
    icon: Code2,
    desc: "Foundational syntaxes for secure, type-safe full-stack microservices.",
    items: [
      { name: "TypeScript", level: "Expert", snippetKey: "typescript" },
      { name: "JavaScript (ES6+)", level: "Expert", snippetKey: "typescript" },
      { name: "Go (Golang)", level: "Advanced", snippetKey: "golang" },
    ],
  },
  {
    id: "02",
    label: "Frontend Systems",
    icon: Layout,
    desc: "Single page apps, Server Side Rendering, and dynamic responsive architectures.",
    items: [
      { name: "React", level: "Expert", snippetKey: "nextjs" },
      { name: "Next.js", level: "Expert", snippetKey: "nextjs" },
      { name: "Zustand", level: "Expert", snippetKey: "nextjs" },
      { name: "React Query", level: "Advanced", snippetKey: "nextjs" },
      { name: "Tailwind CSS", level: "Expert", snippetKey: "nextjs" },
      { name: "ShadCN UI", level: "Expert", snippetKey: "nextjs" },
      { name: "Bootstrap", level: "Advanced", snippetKey: "nextjs" },
    ],
  },
  {
    id: "03",
    label: "Backend Services",
    icon: Server,
    desc: "Fast REST & GraphQL Web Services built for performance and secure data routing.",
    items: [
      { name: "Node.js", level: "Expert", snippetKey: "typescript" },
      { name: "Express.js", level: "Expert", snippetKey: "typescript" },
      { name: "Go (Golang)", level: "Advanced", snippetKey: "golang" },
      { name: "Echo Framework", level: "Advanced", snippetKey: "golang" },
    ],
  },
  {
    id: "04",
    label: "Databases & ORMs",
    icon: Database,
    desc: "Schema designs, indexing, query optimizations, and database models.",
    items: [
      { name: "PostgreSQL", level: "Advanced", snippetKey: "postgresql" },
      { name: "MongoDB", level: "Advanced", snippetKey: "postgresql" },
      { name: "Prisma ORM", level: "Expert", snippetKey: "typescript" },
      { name: "GORM", level: "Advanced", snippetKey: "golang" },
    ],
  },
  {
    id: "05",
    label: "Security & Access",
    icon: ShieldCheck,
    desc: "Standard cryptography tokens, authentication protocols, and OAuth integration.",
    items: [
      { name: "JWT", level: "Expert", snippetKey: "auth" },
      { name: "NextAuth", level: "Advanced", snippetKey: "auth" },
      { name: "BetterAuth", level: "Advanced", snippetKey: "auth" },
      { name: "Firebase Auth", level: "Advanced", snippetKey: "auth" },
    ],
  },
  {
    id: "06",
    label: "Payments",
    icon: CreditCard,
    desc: "SaaS subscriptions, transaction workflows, and multi-currency billing.",
    items: [
      { name: "Stripe", level: "Expert", snippetKey: "stripe" },
      { name: "SSLCommerz", level: "Advanced", snippetKey: "stripe" },
    ],
  },
  {
    id: "07",
    label: "DevOps & Deployment",
    icon: Cloud,
    desc: "Containerized environments, cloud computing, and automated host services.",
    items: [
      { name: "Docker", level: "Advanced", snippetKey: "docker" },
      { name: "AWS (EC2)", level: "Advanced", snippetKey: "docker" },
      { name: "Vercel", level: "Expert", snippetKey: "nextjs" },
      { name: "Netlify", level: "Expert", snippetKey: "nextjs" },
      { name: "Railway", level: "Advanced", snippetKey: "docker" },
    ],
  },
  {
    id: "08",
    label: "Tooling & Workflow",
    icon: Terminal,
    desc: "Team collaboration software, version control systems, and automated task builds.",
    items: [
      { name: "Git", level: "Expert", snippetKey: "git" },
      { name: "GitHub Actions", level: "Expert", snippetKey: "git" },
      { name: "Figma", level: "Intermediate", snippetKey: "git" },
      { name: "CI/CD Pipelines", level: "Advanced", snippetKey: "git" },
      { name: "Linux Shell", level: "Advanced", snippetKey: "git" },
    ],
  },
];

export function Tools() {
  const [activeSnippetKey, setActiveSnippetKey] = useState<string>("typescript");
  const [displaySnippetKey, setDisplaySnippetKey] = useState<string>("typescript");
  const [isFading, setIsFading] = useState<boolean>(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear debounce timeout on component unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = (key: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsFading(true);
      
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = setTimeout(() => {
        setActiveSnippetKey(key);
        setDisplaySnippetKey(key);
        setIsFading(false);
      }, 150); // 150ms fade-out transition duration
    }, 120); // 120ms debounce to prevent flickering when mouse sweeps by
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const activeSnippet = snippets[displaySnippetKey] || snippets.typescript;

  return (
    <section id="skills" className="relative border-y border-border bg-background px-6 py-28 md:py-40">
      {/* Dynamic Background Grid Lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(120,119,198,0.06),rgba(255,255,255,0))]" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <Reveal className="mb-16 flex flex-col gap-4">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-muted-foreground font-semibold">
            Technical Stack
          </span>
          <h2 className="text-4xl font-medium tracking-tight text-foreground md:text-6xl">
            Tools I build with.
          </h2>
          <p className="max-w-xl leading-relaxed text-muted-foreground">
            Hover over any technical skill on the left to see production code snippets and pipeline actions in the interactive IDE.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Pane: Interactive Stack Menu */}
          <div className="space-y-10 lg:col-span-6">
            {groups.map((g, groupIndex) => {
              const Icon = g.icon;
              return (
                <Reveal key={g.label} y={20} delay={groupIndex * 0.04}>
                  <div className="space-y-4">
                    {/* Category Label */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <h3 className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
                        {g.label}
                      </h3>
                      <span className="h-px flex-1 bg-border/40" />
                    </div>

                    {/* Desc */}
                    <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-lg">
                      {g.desc}
                    </p>

                    {/* Tech Pills */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {g.items.map((it) => {
                        const isHovered = activeSnippetKey === it.snippetKey;
                        return (
                          <button
                            key={it.name}
                            onMouseEnter={() => handleMouseEnter(it.snippetKey)}
                            onMouseLeave={handleMouseLeave}
                            className={`group/tag flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs transition-all duration-300 ${
                              isHovered
                                ? "border-foreground bg-foreground/[0.05] text-foreground font-medium shadow-sm"
                                : "border-border bg-foreground/[0.01] text-muted-foreground hover:border-foreground/30 hover:bg-foreground/[0.03] hover:text-foreground"
                            }`}
                          >
                            <span>{it.name}</span>
                            <span
                              className={`font-mono text-[9px] uppercase tracking-wider opacity-60 transition-all duration-300 ${
                                isHovered 
                                  ? "max-w-[80px] ml-1 opacity-60" 
                                  : "max-w-0 overflow-hidden opacity-0 group-hover/tag:max-w-[80px] group-hover/tag:opacity-60 group-hover/tag:ml-1"
                              }`}
                            >
                              // {it.level}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Right Pane: Sticky High-Fidelity Mock IDE */}
          <div className="lg:col-span-6 lg:block">
            <div className="sticky top-28 space-y-6">
              <Reveal y={30} delay={0.1}>
                {/* Mock IDE Window */}
                <div className="relative overflow-hidden rounded-2xl border border-border bg-[#0c0c0e]/95 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-foreground/15 dark:bg-[#08080a]/95">
                  
                  {/* macOS Chrome Header */}
                  <div className="flex items-center justify-between border-b border-border/40 bg-zinc-950/40 px-5 py-3.5">
                    {/* Window Controls */}
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-[#ff5f56]/80" />
                      <span className="h-3 w-3 rounded-full bg-[#ffbd2e]/80" />
                      <span className="h-3 w-3 rounded-full bg-[#27c93f]/80" />
                    </div>

                    {/* Window Title */}
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/80 uppercase tracking-widest">
                      <FileCode2 className="h-3.5 w-3.5 text-blue-400" />
                      <span className={`transition-all duration-200 ${isFading ? 'opacity-0 -translate-x-1.5' : 'opacity-100 translate-x-0'}`}>
                        {activeSnippet.filename}
                      </span>
                    </div>

                    {/* Language Badge */}
                    <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/40">
                      {activeSnippet.lang}
                    </span>
                  </div>

                  {/* Code Editor Tab Bar */}
                  <div className="flex border-b border-border/20 bg-zinc-950/20 px-4">
                    <div className="flex items-center gap-2 border-r border-border/40 border-t border-t-foreground/30 bg-[#0c0c0e] px-4 py-2 font-mono text-[10px] text-foreground">
                      <FileCode2 className="h-3 w-3 text-blue-400" />
                      <span className={`transition-all duration-200 ${isFading ? 'opacity-0 -translate-y-1' : 'opacity-100 translate-y-0'}`}>
                        {activeSnippet.filename}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 font-mono text-[10px] text-muted-foreground/40 hover:text-muted-foreground/75 cursor-pointer">
                      <TerminalSquare className="h-3 w-3" />
                      <span>terminal.sh</span>
                    </div>
                  </div>

                  {/* Code Editor Workspace */}
                  <div className={`overflow-x-auto p-6 font-mono text-xs leading-relaxed text-zinc-300 min-h-[220px] transition-all duration-200 ${isFading ? 'opacity-0 translate-y-1.5' : 'opacity-100 translate-y-0'}`}>
                    <table className="w-full border-collapse">
                      <tbody>
                        {activeSnippet.lines.map((line, idx) => (
                          <tr key={idx} className="group/line hover:bg-foreground/[0.02]">
                            {/* Line Number */}
                            <td className="w-8 select-none pr-4 text-right font-mono text-[10px] text-muted-foreground/30 group-hover/line:text-muted-foreground/65">
                              {idx + 1}
                            </td>
                            {/* Code Text */}
                            <td className="whitespace-pre">
                              {line.length === 0 ? " " : line.map((token, tokenIdx) => (
                                <span key={tokenIdx} className={token.color || ""}>
                                  {token.text}
                                </span>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Integrated Mock Terminal */}
                  <div className="border-t border-border/40 bg-zinc-950/80 px-6 py-4 font-mono text-[11px] text-zinc-400 min-h-[90px]">
                    <div className="flex items-center gap-2 text-muted-foreground/60 mb-2">
                      <Terminal className="h-3.5 w-3.5" />
                      <span>INTEGRATED TERMINAL</span>
                    </div>
                    <pre className={`whitespace-pre-wrap text-emerald-400/90 leading-normal transition-all duration-200 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                      {activeSnippet.terminal}
                    </pre>
                  </div>

                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
