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

export function CtaPageContents() {
  const { cta, fetchCta, updateCta } = usePortfolioStore();
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    headline: "",
    subtext: "",
    buttonLabel: "",
    buttonHref: "",
  });

  useEffect(() => {
    fetchCta().finally(() => setIsLoading(false));
  }, [fetchCta]);

  useEffect(() => {
    if (cta) {
      setFormData({
        headline: cta.headline || "",
        subtext: cta.subtext || "",
        buttonLabel: cta.buttonLabel || "",
        buttonHref: cta.buttonHref || "",
      });
    }
  }, [cta]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCta(formData);
      toast.success("Call to action updated!");
    } catch {
      toast.error("Failed to update call to action.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <FormPageSkeleton fields={4} hasGridRow={false} />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Call to Action"
        description="The banner shown near the bottom of the landing page inviting visitors to reach out."
      />

      <Card className="border border-border shadow-sm dark:shadow-none rounded-xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="headline" className="text-xs font-semibold">Headline</Label>
              <Input
                id="headline"
                required
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtext" className="text-xs font-semibold">Subtext</Label>
              <Textarea
                id="subtext"
                rows={3}
                required
                value={formData.subtext}
                onChange={(e) => setFormData({ ...formData, subtext: e.target.value })}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="buttonLabel" className="text-xs font-semibold">Button Text</Label>
                <Input
                  id="buttonLabel"
                  required
                  value={formData.buttonLabel}
                  onChange={(e) => setFormData({ ...formData, buttonLabel: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buttonHref" className="text-xs font-semibold">Button Link</Label>
                <Input
                  id="buttonHref"
                  required
                  value={formData.buttonHref}
                  onChange={(e) => setFormData({ ...formData, buttonHref: e.target.value })}
                />
                <span className="text-[10px] text-muted-foreground font-sans">
                  e.g. &quot;#contact&quot; to scroll to the in-page contact form, or &quot;/contact&quot; for the Contact page.
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
