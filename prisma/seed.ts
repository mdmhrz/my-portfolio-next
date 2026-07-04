import { PrismaClient } from "@prisma/client";
import { auth } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Create Default Admin User (credentials come from .env — never hardcoded)
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminName = process.env.SEED_ADMIN_NAME;

  // Skip creation entirely if any admin already exists (env vars not required on re-runs)
  const existingAdmin = await prisma.user.findFirst({ where: { role: "admin" } });

  if (existingAdmin) {
    console.log("✅ Admin user already exists");
  } else {
    if (!adminEmail || !adminPassword || !adminName) {
      throw new Error(
        "No admin user found, and SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD / SEED_ADMIN_NAME " +
          "are not set in .env. Set these before running the seed."
      );
    }

    console.log("👤 Creating default admin user via Better-Auth API...");

    // Call the Better-Auth programmatic API to create the user and account records
    await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: adminName,
      },
    });

    // Elevate their role to admin and mark email verified
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: "admin",
        emailVerified: true,
      },
    });

    console.log(`✅ Admin user created (${adminEmail})`);
  }

  // 2. Create Singleton Banner Info (hero presentation only — identity/contact live on Profile)
  const bannerExists = await prisma.banner.findFirst();
  if (!bannerExists) {
    console.log("📺 Creating initial homepage banner text...");
    await prisma.banner.create({
      data: {
        id: "singleton",
        description: "I build production SaaS, CRM, and full-stack web apps — from Next.js interfaces to Node.js & Go APIs, PostgreSQL, and Docker-on-AWS deployments.",
        chips: [
          "Frontend Dev @ Xgenious",
          "SaaS · CRM · Shopify Apps",
          "Docker · AWS · CI/CD"
        ],
      },
    });
    console.log("✅ Banner text seeded");
  } else {
    console.log("✅ Banner text already exists");
  }

  // 3. Create Experience Info (Xgenious)
  let xgenious = await prisma.experience.findFirst({
    where: { company: "Xgenious" },
  });

  if (!xgenious) {
    console.log("💼 Creating career experience (Xgenious)...");
    xgenious = await prisma.experience.create({
      data: {
        company: "Xgenious",
        role: "Frontend Developer",
        location: "Dhaka, BD",
        timeline: "Jul 2025 — Present",
        description: "I develop SaaS and commercial web applications using Next.js, React, TypeScript and Tailwind — collaborating with backend engineers to ship production-ready features and scalable architectures.",
        order: 0,
      },
    });
    console.log("✅ Xgenious experience seeded");
  } else {
    console.log("✅ Xgenious experience already exists");
  }

  // 4. Create Projects
  console.log("📁 Seeding projects...");
  const projectsData = [
    {
      slug: "nexdrop",
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
      featured: true,
      architectureTitle: "Monorepo System Design",
      architectureDesc: "A clean monorepo architecture featuring an Express API backend, a Next.js client application, and a containerized nginx reverse proxy with SSL termination.",
      architectureTree: `nex-drop/
├── nex-drop-backend/       # Express API (Node, Prisma, PostgreSQL)
├── nex-drop-client/        # Next.js 16 web app (React 19, Tailwind v4)
├── nginx/                  # nginx:alpine reverse proxy
├── docker-compose.yaml     # Dev configuration
└── docker-compose.prod.yml # Prod configuration`,
      metrics: [
        { label: "Deployment", value: "AWS EC2" },
        { label: "CI/CD Speed", value: "~2.5m Build" },
        { label: "Database", value: "PostgreSQL" }
      ],
      order: 0,
      experienceId: null, // Personal project
    },
    {
      slug: "taskip",
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
      featured: true,
      architectureTitle: "Modular App Router Architecture",
      architectureDesc: "Structured under Next.js App Router with separated main panels, public auth contexts, and dynamic workspaces for high-security isolation.",
      architectureTree: `taskip-client/
├── app/
│   ├── (auth)/             # Login, 2FA, password resets
│   ├── [workspace]/        # Dynamic tenant workspaces (CRM, Tasks)
│   │   ├── projects/       # Kanban workflows
│   │   ├── invoices/       # Custom billings
│   │   └── settings/       # Workspace controls
└── stores/                 # Zustand global client state`,
      metrics: [
        { label: "Active Tenants", value: "Multi-Tenant" },
        { label: "State Store", value: "Zustand" },
        { label: "Framework", value: "Next.js 14" }
      ],
      order: 1,
      experienceId: xgenious.id, // Linked to Xgenious
    },
    {
      slug: "reportgenix",
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
      span: "lg:col-span-6",
      architectureTitle: null,
      architectureDesc: null,
      architectureTree: null,
      metrics: [
        { label: "Target Platform", value: "Shopify" },
        { label: "Build Tool", value: "Vite" },
        { label: "Framework", value: "React" }
      ],
      order: 2,
      experienceId: xgenious.id, // Linked to Xgenious
    },
    {
      slug: "xilancer",
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
      span: "lg:col-span-6",
      architectureTitle: null,
      architectureDesc: null,
      architectureTree: null,
      metrics: [
        { label: "Server Logic", value: "Laravel" },
        { label: "UI System", value: "Bootstrap" },
        { label: "Interactive", value: "Vanilla JS" }
      ],
      order: 3,
      experienceId: xgenious.id, // Linked to Xgenious
    },
  ];

  for (const proj of projectsData) {
    const existing = await prisma.project.findUnique({
      where: { slug: proj.slug },
    });

    if (!existing) {
      await prisma.project.create({
        data: {
          slug: proj.slug,
          title: proj.title,
          subtitle: proj.subtitle,
          category: proj.category,
          role: proj.role,
          company: proj.company,
          timeline: proj.timeline,
          desc: proj.desc,
          fullDesc: proj.fullDesc,
          tech: proj.tech,
          features: proj.features,
          contributions: proj.contributions,
          live: proj.live,
          image: proj.image,
          featured: proj.featured ?? false,
          span: proj.span,
          architectureTitle: proj.architectureTitle,
          architectureDesc: proj.architectureDesc,
          architectureTree: proj.architectureTree,
          metrics: proj.metrics || undefined,
          order: proj.order,
          experienceId: proj.experienceId,
        },
      });
      console.log(`✅ Project "${proj.title}" seeded`);
    } else {
      console.log(`✅ Project "${proj.title}" already exists`);
    }
  }

  // 5. Ensure homepage case-study projects are flagged featured.
  // Idempotent: nexdrop & taskip drive the "Selected work" section (CaseStudies).
  // Matters after the `add_featured_subject_about_settings_skills` migration, which
  // defaults every existing project to featured = false.
  const featuredResult = await prisma.project.updateMany({
    where: { slug: { in: ["nexdrop", "taskip"] } },
    data: { featured: true },
  });
  console.log(`★ Flagged ${featuredResult.count} project(s) as featured (nexdrop, taskip)`);

  // 6. Profile singleton — create with defaults only if missing (never overwrites).
  // Single source of truth for identity/contact: name, designation, bio, socials.
  const profile = await prisma.profile.findUnique({ where: { id: "singleton" } });
  if (!profile) {
    await prisma.profile.create({
      data: {
        id: "singleton",
        name: "Mobarak Hossain Razu",
        designation: "Full-Stack Developer",
        bio: "Full-stack developer building production SaaS, CRM, and web apps.",
        location: "Dhaka, Bangladesh",
        availability: "Available for projects & roles",
        github: "https://github.com/mdmhrz",
        linkedin: "https://www.linkedin.com/in/mdmhrz",
        facebook: "https://www.facebook.com/mdmhrz",
        email: "mdmobarakhossainrazu@gmail.com",
      },
    });
    console.log("✅ Default Profile singleton seeded");
  } else {
    console.log("✅ Profile already exists — skipped");
  }

  // 7. SiteSettings singleton — create with defaults only if missing (never overwrites).
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!settings) {
    await prisma.siteSettings.create({
      data: { id: "singleton" },
    });
    console.log("✅ Default SiteSettings singleton seeded");
  } else {
    console.log("✅ SiteSettings already exists — skipped");
  }

  // 8. Cta singleton — create with defaults only if missing (never overwrites).
  const cta = await prisma.cta.findUnique({ where: { id: "singleton" } });
  if (!cta) {
    await prisma.cta.create({ data: { id: "singleton" } });
    console.log("✅ Default Cta singleton seeded");
  } else {
    console.log("✅ Cta already exists — skipped");
  }

  // 9. Footer singleton — create with defaults only if missing (never overwrites).
  const footer = await prisma.footer.findUnique({ where: { id: "singleton" } });
  if (!footer) {
    await prisma.footer.create({ data: { id: "singleton" } });
    console.log("✅ Default Footer singleton seeded");
  } else {
    console.log("✅ Footer already exists — skipped");
  }

  // 10. Nav links — seed only if the table is empty (never duplicates).
  const navLinkCount = await prisma.navLink.count();
  if (navLinkCount === 0) {
    const starterNavLinks = [
      { label: "Journey", href: "/#journey", order: 0 },
      { label: "Experience", href: "/#experience", order: 1 },
      { label: "Skills", href: "/#skills", order: 2 },
      { label: "Work", href: "/#work", order: 3 },
      { label: "Blog", href: "/#blog", order: 4 },
      { label: "Contact", href: "/contact", order: 5 },
      { label: "About", href: "/about", order: 6 },
    ];
    await prisma.navLink.createMany({ data: starterNavLinks });
    console.log(`✅ ${starterNavLinks.length} starter nav links seeded`);
  } else {
    console.log(`✅ Nav links already present (${navLinkCount}) — skipped`);
  }

  // 11. Section config — seed only if the table is empty (never duplicates).
  const sectionConfigCount = await prisma.sectionConfig.count();
  if (sectionConfigCount === 0) {
    const starterSections = [
      { key: "techMarquee", order: 0 },
      { key: "journey", order: 1 },
      { key: "experience", order: 2 },
      { key: "tools", order: 3 },
      { key: "caseStudies", order: 4 },
      { key: "homepageBlogs", order: 5 },
      { key: "cta", order: 6 },
      { key: "contact", order: 7 },
    ];
    await prisma.sectionConfig.createMany({ data: starterSections });
    console.log(`✅ ${starterSections.length} starter section configs seeded`);
  } else {
    console.log(`✅ Section configs already present (${sectionConfigCount}) — skipped`);
  }

  // 12. Starter skills — seed only if the table is empty (never duplicates).
  const skillCount = await prisma.skill.count();
  if (skillCount === 0) {
    const starterSkills = [
      { name: "TypeScript", category: "frontend", order: 0 },
      { name: "React", category: "frontend", order: 1 },
      { name: "Next.js", category: "frontend", order: 2 },
      { name: "Tailwind CSS", category: "frontend", order: 3 },
      { name: "Node.js", category: "backend", order: 10 },
      { name: "Express.js", category: "backend", order: 11 },
      { name: "Go", category: "backend", order: 12 },
      { name: "PostgreSQL", category: "database", order: 20 },
      { name: "Prisma", category: "database", order: 21 },
      { name: "MongoDB", category: "database", order: 22 },
      { name: "Docker", category: "devops", order: 30 },
      { name: "AWS", category: "devops", order: 31 },
      { name: "Git", category: "tools", order: 40 },
      { name: "GitHub Actions", category: "tools", order: 41 },
    ];
    await prisma.skill.createMany({ data: starterSkills });
    console.log(`✅ ${starterSkills.length} starter skills seeded`);
  } else {
    console.log(`✅ Skills already present (${skillCount}) — skipped`);
  }

  console.log("🌱 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
