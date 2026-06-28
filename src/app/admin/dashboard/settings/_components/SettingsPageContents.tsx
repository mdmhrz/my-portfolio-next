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

export function SettingsPageContents() {
  const { settings, fetchSettings, updateSettings } = usePortfolioStore();
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ctaHeadline: "",
    ctaSubtext: "",
    footerText: "",
  });

  useEffect(() => {
    fetchSettings().finally(() => setIsLoading(false));
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setFormData({
        ctaHeadline: settings.ctaHeadline || "",
        ctaSubtext: settings.ctaSubtext || "",
        footerText: settings.footerText || "",
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings({
        ctaHeadline: formData.ctaHeadline || null,
        ctaSubtext: formData.ctaSubtext || null,
        footerText: formData.footerText || null,
      });
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <FormPageSkeleton fields={3} hasGridRow={false} />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Site Settings"
        description="Call-to-action headline, subtext, and footer copy."
      />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ctaHeadline" className="text-xs font-semibold">CTA Headline</Label>
              <Input
                id="ctaHeadline"
                type="text"
                value={formData.ctaHeadline}
                onChange={(e) => setFormData({ ...formData, ctaHeadline: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaSubtext" className="text-xs font-semibold">CTA Subtext</Label>
              <Textarea
                id="ctaSubtext"
                rows={3}
                value={formData.ctaSubtext}
                onChange={(e) => setFormData({ ...formData, ctaSubtext: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="footerText" className="text-xs font-semibold">Footer Text</Label>
              <Input
                id="footerText"
                type="text"
                value={formData.footerText}
                onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
              />
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
