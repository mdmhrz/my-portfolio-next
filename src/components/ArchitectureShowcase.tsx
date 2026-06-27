'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Reveal } from "@/components/Reveal";
import { 
  Layers, 
  Server, 
  Database, 
  Cpu, 
  Network, 
  HardDrive, 
  ArrowRight,
  Workflow
} from "lucide-react";

interface NodeDetails {
  id: string;
  title: string;
  role: string;
  tech: string[];
  metric: string;
  metricLabel: string;
  bullets: string[];
}

const NODES: Record<string, NodeDetails> = {
  gateway: {
    id: "gateway",
    title: "Client & Edge Gateway",
    role: "Edge routing layer, reverse proxy, SSL termination, and static asset caching.",
    tech: ["Next.js", "Cloudflare Rules", "TailwindCSS", "Nginx"],
    metric: "99.99%",
    metricLabel: "Uptime SLA",
    bullets: [
      "Dynamic path-based routing resolving static vs dynamic request streams.",
      "Custom middleware for token extraction and edge-based security rules.",
      "Optimized HTTP/3 caching with automatic image optimization."
    ]
  },
  services: {
    id: "services",
    title: "Go API Services",
    role: "Core business logic cluster serving JSON REST API endpoints and stateful WebSocket pipes.",
    tech: ["Go (Golang)", "Gin", "Gorilla WebSockets", "Redis client"],
    metric: "< 14ms",
    metricLabel: "Avg Latency",
    bullets: [
      "Goroutine-backed concurrency handling thousands of socket operations simultaneously.",
      "Custom memory buffer pools to reduce garbage collection pause times under heavy traffic.",
      "Structured JSON-logging with automated request correlation tracking."
    ]
  },
  broker: {
    id: "broker",
    title: "Redis Event Stream",
    role: "Event bus distributing async workloads across background systems.",
    tech: ["Redis Streams", "Memory cache", "Sentinel clustering"],
    metric: "120k/s",
    metricLabel: "Peak Throughput",
    bullets: [
      "Strict consumer-group synchronization preventing message processing duplicates.",
      "Decoupled publish-subscribe pattern with automatic exponential dead-letter retry logic.",
      "Dynamic rate-limiting backed by sliding-window token buckets."
    ]
  },
  db: {
    id: "db",
    title: "PostgreSQL Database",
    role: "Primary transaction engine storing normalized tables, indexes, and session states.",
    tech: ["PostgreSQL", "PgBouncer", "SQLAlchemy", "Prisma"],
    metric: "125ms",
    metricLabel: "Max Query Cap",
    bullets: [
      "Highly indexed foreign-key schemas optimized for rapid multi-table joins.",
      "Connection pooling managed by PgBouncer for optimal hardware utilization.",
      "Hourly system backups with automated integrity restoration validations."
    ]
  },
  workers: {
    id: "workers",
    title: "Async Task Workers",
    role: "Stateless queue consumers processing long-running operations and reports.",
    tech: ["Docker", "Go", "Github Actions", "BullMQ"],
    metric: "1.2M",
    metricLabel: "Daily Tasks",
    bullets: [
      "Isolated container clusters scaling dynamically based on queue depth metrics.",
      "Stateless design ensuring failures can be safely retried on secondary workers.",
      "Automated alerting integrations informing systems of stuck or invalid queues."
    ]
  },
  storage: {
    id: "storage",
    title: "AWS S3 / Assets Store",
    role: "Secure object store hosting media, files, user uploads, and database dumps.",
    tech: ["AWS S3", "IAM Policies", "AWS CloudFront"],
    metric: "11 9s",
    metricLabel: "Durability",
    bullets: [
      "Strict access-control list (ACL) rules ensuring user upload isolation.",
      "Pre-signed secure URL distribution protecting private static assets.",
      "Lifecycle rules archiving old log datasets to low-cost Glacier vaults."
    ]
  }
};

const PIPELINES = [
  { id: "gateway-services", d: "M 25% 20% L 50% 20% L 50% 50%", nodes: ["gateway", "services"] },
  { id: "services-broker", d: "M 50% 50% L 25% 50%", nodes: ["services", "broker"] },
  { id: "broker-workers", d: "M 25% 50% L 25% 80%", nodes: ["broker", "workers"] },
  { id: "services-db", d: "M 50% 50% L 75% 50% L 75% 80%", nodes: ["services", "db"] },
  { id: "workers-db", d: "M 25% 80% L 75% 80%", nodes: ["workers", "db"] },
  { id: "db-storage", d: "M 75% 80% L 75% 50%", nodes: ["db", "storage"] },
];

function MetricGauge({ value, label, id }: { value: string; label: string; id: string }) {
  let percentage = 80;
  if (id === "gateway") percentage = 99;
  if (id === "services") percentage = 92;
  if (id === "broker") percentage = 85;
  if (id === "db") percentage = 78;
  if (id === "workers") percentage = 74;
  if (id === "storage") percentage = 95;

  const radius = 30;
  const strokeDasharray = 2 * Math.PI * radius;
  const strokeDashoffset = strokeDasharray - (percentage / 100) * strokeDasharray;

  return (
    <div className="flex items-center gap-4 bg-muted/20 border border-border/40 rounded-xl p-4.5">
      <div className="relative h-16 w-16 shrink-0 flex items-center justify-center">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} className="stroke-border/40" strokeWidth="5.5" fill="none" />
          <motion.circle 
            cx="40" 
            cy="40" 
            r={radius} 
            className="stroke-indigo-600 dark:stroke-indigo-500" 
            strokeWidth="5.5" 
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: strokeDasharray }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute text-[11px] font-mono font-bold text-foreground">{value}</span>
      </div>
      <div>
        <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/60">Benchmark Metric</div>
        <div className="text-xs font-semibold text-foreground mt-0.5">{label}</div>
      </div>
    </div>
  );
}

export function ArchitectureShowcase() {
  const [selectedId, setSelectedId] = useState<string>("services");
  const details = NODES[selectedId];

  return (
    <section id="architecture" className="relative border-t border-border bg-neutral-50/10 dark:bg-background/20 px-6 py-28 md:py-40 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-indigo-500/[0.03] dark:bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <Reveal className="mb-16 flex flex-col gap-4">
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 font-semibold">
            System Design
          </span>
          <h2 className="text-4xl font-medium tracking-tight text-foreground md:text-6xl">
            Core architecture.
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            A high-fidelity layout of the production systems I design. Click any component in the blueprint to inspect technical implementations.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
          
          {/* Left: Interactive Diagram Blueprint */}
          <div className="relative rounded-3xl border border-border bg-card/60 dark:bg-card/25 backdrop-blur-md p-8 lg:col-span-7 aspect-[4/3] flex flex-col justify-between shadow-sm overflow-hidden select-none">
            
            {/* Grid coordinates */}
            <div className="absolute top-4 left-5 font-mono text-[9px] text-muted-foreground/35 select-none font-semibold">
              SYS.LOC // 45.9082.N
            </div>
            <div className="absolute bottom-4 right-5 font-mono text-[9px] text-muted-foreground/35 select-none font-semibold">
              GRID_ID // B.0912
            </div>

            {/* Grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.012)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none rounded-3xl" />

            {/* SVG Connecting Pipelines */}
            <svg className="absolute inset-0 h-full w-full pointer-events-none overflow-visible" fill="none">
              {PIPELINES.map((pipeline) => {
                const isActive = pipeline.nodes.includes(selectedId);
                return (
                  <g key={pipeline.id}>
                    {/* Pipeline track shadow */}
                    <path
                      d={pipeline.d}
                      className="stroke-neutral-200/60 dark:stroke-zinc-800/40"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    {/* Animated data pulses */}
                    <motion.path
                      d={pipeline.d}
                      className="stroke-indigo-600 dark:stroke-indigo-500"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="6 24"
                      animate={{ strokeDashoffset: [0, -48] }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: isActive ? 1.5 : 3.5, 
                        ease: "linear" 
                      }}
                      style={{ 
                        opacity: isActive ? 1 : 0.15,
                        filter: isActive ? "drop-shadow(0 0 3px rgba(99,102,241,0.4))" : "none"
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Node 1: Client Gateway */}
            <button
              onClick={() => setSelectedId("gateway")}
              style={{ top: "20%", left: "25%", transform: "translate(-50%, -50%)" }}
              className={`absolute flex items-center gap-3.5 rounded-2xl border px-5 py-4 transition-all text-left group cursor-pointer z-20 ${
                selectedId === "gateway"
                  ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/20 text-foreground dark:text-white shadow-[0_0_20px_rgba(99,102,241,0.08)] scale-[1.03]"
                  : "border-border bg-card/90 text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:scale-[1.01]"
              }`}
            >
              <div className="relative">
                <Layers className={`h-5.5 w-5.5 transition-colors ${selectedId === "gateway" ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground/60 group-hover:text-foreground"}`} />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <div className="text-xs font-bold tracking-tight">Edge Gateway</div>
                <div className="text-[9px] font-mono text-muted-foreground/60 mt-0.5">HTTP/3 · SSL</div>
              </div>
            </button>

            {/* Node 2: Redis Streams */}
            <button
              onClick={() => setSelectedId("broker")}
              style={{ top: "50%", left: "25%", transform: "translate(-50%, -50%)" }}
              className={`absolute flex items-center gap-3.5 rounded-2xl border px-5 py-4 transition-all text-left group cursor-pointer z-20 ${
                selectedId === "broker"
                  ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/20 text-foreground dark:text-white shadow-[0_0_20px_rgba(99,102,241,0.08)] scale-[1.03]"
                  : "border-border bg-card/90 text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:scale-[1.01]"
              }`}
            >
              <div className="relative">
                <Network className={`h-5.5 w-5.5 transition-colors ${selectedId === "broker" ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground/60 group-hover:text-foreground"}`} />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                </span>
              </div>
              <div>
                <div className="text-xs font-bold tracking-tight">Redis Event Bus</div>
                <div className="text-[9px] font-mono text-muted-foreground/60 mt-0.5">Streams · PubSub</div>
              </div>
            </button>

            {/* Node 3: Go Services */}
            <button
              onClick={() => setSelectedId("services")}
              style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
              className={`absolute flex items-center gap-4 rounded-2xl border px-6 py-5 transition-all text-left group cursor-pointer z-20 ${
                selectedId === "services"
                  ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/25 text-foreground dark:text-white shadow-[0_0_25px_rgba(99,102,241,0.12)] scale-[1.03]"
                  : "border-border bg-card/90 text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:scale-[1.01]"
              }`}
            >
              <div className="relative">
                <Server className={`h-6.5 w-6.5 transition-colors ${selectedId === "services" ? "text-indigo-600 dark:text-indigo-400 animate-pulse" : "text-muted-foreground/60 group-hover:text-foreground"}`} />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                </span>
              </div>
              <div>
                <div className="text-sm font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Go Services</div>
                <div className="text-[9px] font-mono text-muted-foreground/60 mt-0.5">REST APIs · Sockets</div>
              </div>
            </button>

            {/* Node 4: AWS S3 */}
            <button
              onClick={() => setSelectedId("storage")}
              style={{ top: "50%", left: "75%", transform: "translate(-50%, -50%)" }}
              className={`absolute flex items-center gap-3.5 rounded-2xl border px-5 py-4 transition-all text-left group cursor-pointer z-20 ${
                selectedId === "storage"
                  ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/20 text-foreground dark:text-white shadow-[0_0_20px_rgba(99,102,241,0.08)] scale-[1.03]"
                  : "border-border bg-card/90 text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:scale-[1.01]"
              }`}
            >
              <div className="relative">
                <HardDrive className={`h-5.5 w-5.5 transition-colors ${selectedId === "storage" ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground/60 group-hover:text-foreground"}`} />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <div className="text-xs font-bold tracking-tight">S3 Asset Hub</div>
                <div className="text-[9px] font-mono text-muted-foreground/60 mt-0.5">AWS S3 · Caching</div>
              </div>
            </button>

            {/* Node 5: Task Workers */}
            <button
              onClick={() => setSelectedId("workers")}
              style={{ top: "80%", left: "25%", transform: "translate(-50%, -50%)" }}
              className={`absolute flex items-center gap-3.5 rounded-2xl border px-5 py-4 transition-all text-left group cursor-pointer z-20 ${
                selectedId === "workers"
                  ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/20 text-foreground dark:text-white shadow-[0_0_20px_rgba(99,102,241,0.08)] scale-[1.03]"
                  : "border-border bg-card/90 text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:scale-[1.01]"
              }`}
            >
              <div className="relative">
                <Cpu className={`h-5.5 w-5.5 transition-colors ${selectedId === "workers" ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground/60 group-hover:text-foreground"}`} />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                </span>
              </div>
              <div>
                <div className="text-xs font-bold tracking-tight">Task Workers</div>
                <div className="text-[9px] font-mono text-muted-foreground/60 mt-0.5">BullMQ · Docker</div>
              </div>
            </button>

            {/* Node 6: PostgreSQL */}
            <button
              onClick={() => setSelectedId("db")}
              style={{ top: "80%", left: "75%", transform: "translate(-50%, -50%)" }}
              className={`absolute flex items-center gap-3.5 rounded-2xl border px-5 py-4 transition-all text-left group cursor-pointer z-20 ${
                selectedId === "db"
                  ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/20 text-foreground dark:text-white shadow-[0_0_20px_rgba(99,102,241,0.08)] scale-[1.03]"
                  : "border-border bg-card/90 text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:scale-[1.01]"
              }`}
            >
              <div className="relative">
                <Database className={`h-5.5 w-5.5 transition-colors ${selectedId === "db" ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground/60 group-hover:text-foreground"}`} />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                </span>
              </div>
              <div>
                <div className="text-xs font-bold tracking-tight">PostgreSQL</div>
                <div className="text-[9px] font-mono text-muted-foreground/60 mt-0.5">Core SQL DB</div>
              </div>
            </button>

          </div>

          {/* Right: Technical Inspector details card */}
          <div className="lg:col-span-5 h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="rounded-3xl border border-border bg-card/60 dark:bg-card/25 backdrop-blur-md p-7 md:p-9 flex flex-col justify-between h-full min-h-[440px] shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-bold">
                      <Workflow className="h-4 w-4" /> Technical Inspector
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 px-2.5 py-1 text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase select-none">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Status: Active
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    {details.title}
                  </h3>

                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {details.role}
                  </p>

                  {/* Stacks chips */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {details.tech.map((t) => (
                      <span
                        key={t}
                        className="rounded-lg border border-border bg-muted/40 px-3 py-1 font-mono text-[10px] text-muted-foreground font-semibold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <ul className="mt-8 space-y-4">
                    {details.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-3.5 text-xs leading-relaxed text-muted-foreground">
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Metric block with Gauge */}
                <div className="mt-10 pt-6 border-t border-border">
                  <MetricGauge value={details.metric} label={details.metricLabel} id={details.id} />
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
