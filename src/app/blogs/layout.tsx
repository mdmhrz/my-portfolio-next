import { BlogNavbar } from "./_components/BlogNavbar";
import { BlogFooter } from "./_components/BlogFooter";
import { AppearanceColorScope } from "@/components/global/AppearanceColorScope";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppearanceColorScope scope="public">
      <div className="relative min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
        <BlogNavbar />
        <main>{children}</main>
        <BlogFooter />
      </div>
    </AppearanceColorScope>
  );
}
