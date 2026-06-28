'use client';

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { usePortfolioStore } from "@/store/usePortfolioStore";

export function BannerPageContents() {
  const { banner, fetchBanner, updateBanner } = usePortfolioStore();
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
    fetchBanner();
  }, [fetchBanner]);

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

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-mono text-[10px] uppercase tracking-wider font-semibold">Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title" className="font-mono text-[10px] uppercase tracking-wider font-semibold">Title</Label>
                <Input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-mono text-[10px] uppercase tracking-wider font-semibold">Description</Label>
              <Textarea
                id="description"
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chips" className="font-mono text-[10px] uppercase tracking-wider font-semibold">Skills / Chips (Comma Separated)</Label>
              <Input
                id="chips"
                type="text"
                required
                value={formData.chips}
                onChange={(e) => setFormData({ ...formData, chips: e.target.value })}
              />
              <span className="text-[10px] text-muted-foreground font-mono">Example: Frontend Dev @ Xgenious, Next.js, Docker</span>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-4">// Social Accounts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="github" className="font-mono text-[10px] uppercase tracking-wider">GitHub Link</Label>
                  <Input id="github" type="url" value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="font-mono text-[10px] uppercase tracking-wider">LinkedIn Link</Label>
                  <Input id="linkedin" type="url" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="font-mono text-[10px] uppercase tracking-wider">Facebook Link</Label>
                  <Input id="facebook" type="url" value={formData.facebook} onChange={(e) => setFormData({ ...formData, facebook: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-mono text-[10px] uppercase tracking-wider">Public Contact Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
