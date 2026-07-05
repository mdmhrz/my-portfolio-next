import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import { ThemeProvider } from "@/components/global/ThemeProvider";
import { AppearanceFont } from "@/components/global/AppearanceFont";
import { Toaster } from "@/components/ui/sonner";

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
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  const favicon = settings?.faviconUrl || "/brand/default-favicon.svg";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Mobarak Hossain | Full-Stack Developer",
      template: "%s | Mobarak Hossain Razu",
    },
    description: SITE_DESCRIPTION,
    keywords: [
      "Full-Stack Developer", "Next.js", "React", "Node.js", "Go",
      "PostgreSQL", "Docker", "AWS", "Mobarak Hossain", "Razu",
      "Software Engineer", "Portfolio", "Bangladesh Developer",
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
  sameAs: ["https://github.com/mdmhrz"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={satoshi.variable} suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className="antialiased font-sans bg-background text-foreground">
        <AppearanceFont />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <ThemeProvider>
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
