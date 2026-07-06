import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import { ThemeProvider } from "@/components/global/ThemeProvider";
import { AppearanceFont } from "@/components/global/AppearanceFont";
import { AnalyticsBeacon } from "@/components/global/AnalyticsBeacon";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const satoshi = localFont({
  src: [
    { path: "../../public/fonts/satoshi/satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/satoshi/satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/satoshi/satoshi-700.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/satoshi/satoshi-900.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-satoshi",
});

const SITE_URL = "https://mhrazu.com";
const SITE_NAME = "Mobarak Hossain Razu";
const SITE_DESCRIPTION =
  "Mobarak Hossain Razu — Full-Stack Developer specializing in Next.js, React, Node.js, Go, PostgreSQL, Docker, and AWS.";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null);
  const favicon = settings?.faviconUrl || "/brand/default-favicon.svg";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Mobarak Hossain | Full-Stack Developer",
      template: "%s | Mobarak Hossain Razu",
    },
    description: SITE_DESCRIPTION,
    keywords: [
      "Full-Stack Developer", "Md. Mobarak Hossain", "Mobarak Hossain Razu", "Razu",
      "Next.js Developer", "React Developer", "Node.js Developer", "Go Developer",
      "TypeScript", "JavaScript", "PostgreSQL", "Prisma ORM", "Docker", "AWS",
      "Tailwind CSS", "REST API", "System Design", "SaaS Development",
      "Web Application Developer", "Software Engineer", "Bangladesh Developer", "Portfolio",
    ],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      siteName: SITE_NAME,
      title: "Mobarak Hossain | Full-Stack Developer",
      description: SITE_DESCRIPTION,
      // og:image is injected automatically from opengraph-image.tsx at this route level
    },
    twitter: {
      card: "summary_large_image",
      title: "Mobarak Hossain | Full-Stack Developer",
      description: SITE_DESCRIPTION,
      // twitter:image is derived from the opengraph-image.tsx file
    },
    alternates: {
      canonical: SITE_URL,
    },
  };
}

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  url: SITE_URL,
  jobTitle: "Full-Stack Developer",
  description: SITE_DESCRIPTION,
  sameAs: [
    "https://github.com/mdmhrz",
    "https://www.linkedin.com/in/mdmhrz",
    "https://www.facebook.com/mdmhrz",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={satoshi.variable} suppressHydrationWarning>
      <head>
        {/* This is for development purpose only-React Grab */}
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>

      <body className="antialiased font-sans bg-background text-foreground">

        {/* Applies the admin-configured font override to the document at runtime */}
        <AppearanceFont />

        {/* Person structured data (JSON-LD) so search engines can surface a rich snippet */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />

        {/* Supplies light/dark theme context to the app and persists the user's preference */}
        <ThemeProvider>
          {children}
          {/* Renders toast notifications triggered from anywhere in the app */}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
        {/* Vercel Analytics — tracks page views and traffic (viewed in Vercel dashboard) */}
        <Analytics />
        {/* Vercel Speed Insights — tracks Core Web Vitals performance (viewed in Vercel dashboard) */}
        <SpeedInsights />
        {/* First-party pageview tracking (powers the admin dashboard metrics) */}
        <AnalyticsBeacon />
      </body>
    </html>
  );
}
