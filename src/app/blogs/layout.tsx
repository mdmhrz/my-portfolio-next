import { prisma } from "@/lib/prisma";
import { BlogNavbar } from "./_components/BlogNavbar";
import { BlogFooter } from "./_components/BlogFooter";
import { AppearanceColorScope } from "@/components/global/AppearanceColorScope";

export default async function BlogLayout({ children }: { children: React.ReactNode }) {
  const settings = await prisma.siteSettings
    .findUnique({ where: { id: "singleton" } })
    .catch(() => null);

  return (
    <AppearanceColorScope scope="public">
      <div className="relative min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <BlogNavbar
          logoUrl={settings?.logoUrl}
          logoAlt={settings?.logoAlt}
          logoUrlDark={settings?.logoUrlDark}
          logoAltDark={settings?.logoAltDark}
        />
        <main>{children}</main>
        <BlogFooter
          logoUrl={settings?.logoUrl}
          logoAlt={settings?.logoAlt}
          logoUrlDark={settings?.logoUrlDark}
          logoAltDark={settings?.logoAltDark}
        />
      </div>
    </AppearanceColorScope>
  );
}
