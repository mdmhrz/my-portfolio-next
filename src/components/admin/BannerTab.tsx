'use client';

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function BannerTab({ banner, updateBanner }: { banner: any; updateBanner: any }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    chips: "",
    github: "",
    linkedin: "",
    facebook: "",
    email: "",
  });

  useEffect(() => {
    if (banner) {
      setFormData({
        name: banner.name || "",
        title: banner.title || "",
        description: banner.description || "",
        chips: Array.isArray(banner.chips) ? banner.chips.join(", ") : "",
        github: banner.github || "",
        linkedin: banner.linkedin || "",
        facebook: banner.facebook || "",
        email: banner.email || "",
      });
    }
  }, [banner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const chipsArray = formData.chips
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    try {
      await updateBanner({ ...formData, chips: chipsArray });
      toast.success("Banner updated successfully!");
    } catch (err) {
      toast.error("Failed to update banner.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">Hero Banner</h1>
        <p className="text-sm text-muted-foreground">Configure text parameters, chips, and socials displayed on the landing page hero.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-foreground/50 focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-foreground/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Description</label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-foreground/50 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Skills / Chips (Comma Separated)</label>
          <input
            type="text"
            required
            value={formData.chips}
            onChange={(e) => setFormData({ ...formData, chips: e.target.value })}
            className="block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-foreground/50 focus:outline-none"
          />
          <span className="text-[10px] text-muted-foreground font-mono">Example: Frontend Dev @ Xgenious, Next.js, Docker</span>
        </div>

        <div className="border-t border-border pt-6">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-4">// Social Accounts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">GitHub Link</label>
              <input type="url" value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-foreground/50" />
            </div>
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">LinkedIn Link</label>
              <input type="url" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-foreground/50" />
            </div>
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Facebook Link</label>
              <input type="url" value={formData.facebook} onChange={(e) => setFormData({ ...formData, facebook: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-foreground/50" />
            </div>
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Public Contact Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="block w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-foreground/50" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-foreground hover:bg-foreground/90 px-5 py-3 text-xs font-mono uppercase tracking-wider text-background transition-all cursor-pointer font-bold disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
