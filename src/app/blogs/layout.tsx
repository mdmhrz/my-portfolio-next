import { BlogNavbar } from "./_components/BlogNavbar";
import { BlogFooter } from "./_components/BlogFooter";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary selection:text-black">
      <BlogNavbar />
      <main>{children}</main>
      <BlogFooter />
    </div>
  );
}
