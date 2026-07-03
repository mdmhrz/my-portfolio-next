'use client';

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { usePortfolioStore } from "@/store/usePortfolioStore";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormPageSkeleton } from "@/components/admin/FormPageSkeleton";

export function BannerPageContents() {
  const { banner, fetchBanner, updateBanner } = usePortfolioStore();
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    chips: "",
  });

  useEffect(() => {
    fetchBanner().finally(() => setIsLoading(false));
  }, [fetchBanner]);

  useEffect(() => {
    if (banner) {
      setFormData({
        description: banner.description || "",
        chips: Array.isArray(banner.chips) ? banner.chips.join(", ") : "",
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
      toast.success("Hero banner updated successfully!");
    } catch {
      toast.error("Failed to update hero banner.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <FormPageSkeleton fields={2} hasGridRow={false} />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Hero Banner"
        description="Presentation-only styling for the landing page hero — tagline and tech chips. Your name, contact links, and photo live under Profile."
      />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-semibold">Hero Tagline</Label>
              <Textarea
                id="description"
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chips" className="text-xs font-semibold">Skills / Chips (Comma Separated)</Label>
              <Input
                id="chips"
                type="text"
                required
                value={formData.chips}
                onChange={(e) => setFormData({ ...formData, chips: e.target.value })}
              />
              <span className="text-[10px] text-muted-foreground font-sans">
                Example: Frontend Dev @ Xgenious, Next.js, Docker
              </span>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
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
