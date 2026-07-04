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
import { PageHeader } from "@/components/admin/PageHeader";
import { FormPageSkeleton } from "@/components/admin/FormPageSkeleton";

export function FooterPageContents() {
  const { footer, fetchFooter, updateFooter } = usePortfolioStore();
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    availabilityBadge: "",
    availabilityText: "",
    location: "",
    primaryStack: "",
    copyrightName: "",
  });

  useEffect(() => {
    fetchFooter().finally(() => setIsLoading(false));
  }, [fetchFooter]);

  useEffect(() => {
    if (footer) {
      setFormData({
        bio: footer.bio || "",
        availabilityBadge: footer.availabilityBadge || "",
        availabilityText: footer.availabilityText || "",
        location: footer.location || "",
        primaryStack: footer.primaryStack || "",
        copyrightName: footer.copyrightName || "",
      });
    }
  }, [footer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateFooter({ ...formData, bio: formData.bio || null });
      toast.success("Footer updated!");
    } catch {
      toast.error("Failed to update footer.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <FormPageSkeleton fields={6} hasGridRow={false} />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Footer"
        description="Content shown in the site-wide footer — brand bio, availability card, and copyright."
      />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-xs font-semibold">Brand Bio</Label>
              <Textarea
                id="bio"
                rows={3}
                placeholder="Leave blank to use your Profile bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="availabilityBadge" className="text-xs font-semibold">Availability Badge</Label>
                <Input
                  id="availabilityBadge"
                  required
                  value={formData.availabilityBadge}
                  onChange={(e) => setFormData({ ...formData, availabilityBadge: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs font-semibold">Location</Label>
                <Input
                  id="location"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availabilityText" className="text-xs font-semibold">Availability Text</Label>
              <Textarea
                id="availabilityText"
                rows={2}
                required
                value={formData.availabilityText}
                onChange={(e) => setFormData({ ...formData, availabilityText: e.target.value })}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="primaryStack" className="text-xs font-semibold">Primary Stack</Label>
                <Input
                  id="primaryStack"
                  required
                  value={formData.primaryStack}
                  onChange={(e) => setFormData({ ...formData, primaryStack: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="copyrightName" className="text-xs font-semibold">Copyright Name</Label>
                <Input
                  id="copyrightName"
                  required
                  value={formData.copyrightName}
                  onChange={(e) => setFormData({ ...formData, copyrightName: e.target.value })}
                />
                <span className="text-[10px] text-muted-foreground font-sans">
                  Shown as &quot;© {new Date().getFullYear()} {formData.copyrightName || "…"}&quot;
                </span>
              </div>
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
