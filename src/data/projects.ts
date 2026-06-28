export interface ProjectDetails {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  desc: string;
  fullDesc: string;
  tech: string[];
  features: string[];
  contributions: string[];
  live: string;
  image: string;
  imageAlt?: string;
  span?: string; // For layout grid spanning in CaseStudies

  // Premium fields for details page/modal
  role?: string;
  company?: string;
  timeline?: string;
  architecture?: {
    title: string;
    description: string;
    tree?: string;
  };
  metrics?: { label: string; value: string }[];
}

export const projects: ProjectDetails[] = [
  {
    id: "nexdrop",
    title: "NexDrop",
    subtitle: "Parcel Delivery Management Platform",
    category: "Full-Stack · Logistics",
    role: "Lead Architect & Developer",
    company: "Personal Project",
    timeline: "2025 - 2026",
    desc: "Full-stack parcel delivery platform with dedicated dashboards for customers, riders, admins & super-admins. Real-time tracking, rider earnings, and Stripe + SSLCommerz payments.",
    fullDesc: "NexDrop is a production-grade logistics and parcel delivery management platform built from scratch to serve the Bangladesh market. It supports customers, riders, and administrators through dedicated dashboards, featuring real-time parcel lifecycle tracking, dynamic pricing models, multi-gateway payments, and automatic deployments on cloud infrastructure.",
    tech: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Node.js",
      "Express.js",
      "PostgreSQL",
      "Prisma",
      "Docker",
      "nginx",
      "AWS EC2",
      "Stripe",
      "SSLCommerz",
      "Tailwind CSS"
    ],
    features: [
      "Customer Dashboard: Address book, dynamic parcel booking, payments & rating systems.",
      "Rider App: Accept deliveries, track earnings history, update availability, and request cashouts.",
      "Admin Panel: Approve rider profiles, manage parcels, approve cashouts, and view analytics.",
      "Security: JWT auth with HttpOnly cookies, Zod schema validation, and role-based access control.",
      "AI Assistant: AI chatbot powered by OpenRouter for automated customer support."
    ],
    contributions: [
      "Architected the monorepo from scratch, establishing Docker setups for local development and production environments.",
      "Implemented JWT session authentication via HttpOnly cookies and robust Role-Based Access Control (RBAC).",
      "Configured automated CI/CD pipelines using GitHub Actions to lint, test, build Docker images, and deploy to AWS EC2.",
      "Integrated SSLCommerz and Stripe payment gateways along with transactional email notifications."
    ],
    live: "https://nexdrop.mhrazu.com",
    image: "/nex-drop.png",
    span: "lg:col-span-7",
    architecture: {
      title: "Monorepo System Design",
      description: "A clean monorepo architecture featuring an Express API backend, a Next.js client application, and a containerized nginx reverse proxy with SSL termination.",
      tree: `nex-drop/
├── nex-drop-backend/       # Express API (Node, Prisma, PostgreSQL)
├── nex-drop-client/        # Next.js 16 web app (React 19, Tailwind v4)
├── nginx/                  # nginx:alpine reverse proxy
├── docker-compose.yaml     # Dev configuration
└── docker-compose.prod.yml # Prod configuration`
    },
    metrics: [
      { label: "Deployment", value: "AWS EC2" },
      { label: "CI/CD Speed", value: "~2.5m Build" },
      { label: "Database", value: "PostgreSQL" }
    ]
  },
  {
    id: "taskip",
    title: "Taskip",
    subtitle: "SaaS Client Portal & CRM",
    category: "SaaS · CRM",
    role: "Frontend Developer",
    company: "Xgenious",
    timeline: "2025 — Present",
    desc: "Multi-tenant SaaS for agencies — CRM, project management, ticketing and client collaboration in one workspace.",
    fullDesc: "Taskip is an enterprise-grade SaaS project management and client portal platform. It centralizes client relationship management (CRM), task boards, customer ticketing, dynamic invoicing, and calendar bookings into a single, unified corporate workspace.",
    tech: [
      "Next.js 14",
      "React 18",
      "TypeScript",
      "Zustand",
      "shadcn/ui",
      "Tailwind CSS",
      "Pusher",
      "Recharts",
      "TipTap",
      "NextAuth",
      "Sentry"
    ],
    features: [
      "Project Boards: Interactive Kanban boards (dnd-kit) and custom status flows.",
      "Client Portal: White-labeled client workspace for file access and onboarding wizards.",
      "Invoicing System: Live PDF invoice builders (jsPDF) with Stripe integrations.",
      "Workflow Automation: Node-based visual editor (xyflow) to automate repetitive tasks.",
      "Collaboration: Real-time chat messaging using Pusher and integrated email compilers."
    ],
    contributions: [
      "Built the client portal, multi-step onboarding wizard, and interactive CRM dashboard layouts.",
      "Led the migration from subdomain-based routing to path-based workspace routes to optimize caching.",
      "Implemented complex UI boards, Gantt charts, and custom form builders using Radix UI primitives.",
      "Configured Sentry monitoring and resolved Core Web Vitals performance gaps."
    ],
    live: "https://taskip.app",
    image: "/projects/taskip.png",
    span: "lg:col-span-5",
    architecture: {
      title: "Modular App Router Architecture",
      description: "Structured under Next.js App Router with separated main panels, public auth contexts, and dynamic workspaces for high-security isolation.",
      tree: `taskip-client/
├── app/
│   ├── (auth)/             # Login, 2FA, password resets
│   ├── [workspace]/        # Dynamic tenant workspaces (CRM, Tasks)
│   │   ├── projects/       # Kanban workflows
│   │   ├── invoices/       # Custom billings
│   │   └── settings/       # Workspace controls
└── stores/                 # Zustand global client state`
    },
    metrics: [
      { label: "Active Tenants", value: "Multi-Tenant" },
      { label: "State Store", value: "Zustand" },
      { label: "Framework", value: "Next.js 14" }
    ]
  },
  {
    id: "reportgenix",
    title: "ReportGenix",
    subtitle: "Automated Report Builder",
    category: "Shopify App",
    role: "Frontend Developer",
    company: "Xgenious",
    timeline: "2025",
    desc: "Custom reporting & automated report builder for Shopify merchants.",
    fullDesc: "ReportGenix is a Shopify application that automates custom report building. It empowers merchants to structure and schedule complex marketing, sales, and inventory reports, syncing seamlessly with their active store catalogs.",
    tech: ["React (Vite)", "TypeScript", "Tailwind CSS", "Shopify Polaris"],
    features: [
      "Custom Report Builder: Interactive, drag-and-drop column configurators.",
      "Data Sync: Real-time Shopify GraphQL API synchronization.",
      "Schedules: Automate reports to send via email or save to cloud storage."
    ],
    contributions: [
      "Developed custom reporting and automated report builder modules.",
      "Built responsive, performance-optimized data tables capable of rendering 10k+ rows.",
      "Polished UI consistency and state synchronization using custom React context hooks."
    ],
    live: "https://reportgenix.com",
    image: "/projects/reportgenix.png",
    metrics: [
      { label: "Target Platform", value: "Shopify" },
      { label: "Build Tool", value: "Vite" },
      { label: "Framework", value: "React" }
    ]
  },
  {
    id: "xilancer",
    title: "Xilancer",
    subtitle: "Commercial Freelance Marketplace",
    category: "Marketplace",
    role: "Frontend Developer",
    company: "Xgenious",
    timeline: "2025",
    desc: "Freelance marketplace solution for commercial distribution.",
    fullDesc: "Xilancer is a commercial freelance marketplace platform. It allows businesses to deploy their own localized gig marketplace, supporting orders, custom gig packages, milestones, and admin dashboards.",
    tech: ["JavaScript", "Bootstrap", "Laravel", "Blade"],
    features: [
      "Gig Catalog: Comprehensive search and filtering for services and packages.",
      "Order Tracker: Multi-stage gig completion tracking and milestone management.",
      "Admin Controls: Centralized panel for managing commissions, users, and disputes."
    ],
    contributions: [
      "Developed frontend application layouts and integrated server-side Blade templates.",
      "Built lightweight, reusable JavaScript utilities to handle custom interactions and tables.",
      "Refined mobile responsiveness and resolved layout shifts across payment paths."
    ],
    live: "https://xilancer.xgenious.com",
    image: "/projects/xilancer.png",
    metrics: [
      { label: "Server Logic", value: "Laravel" },
      { label: "UI System", value: "Bootstrap" },
      { label: "Interactive", value: "Vanilla JS" }
    ]
  }
];
