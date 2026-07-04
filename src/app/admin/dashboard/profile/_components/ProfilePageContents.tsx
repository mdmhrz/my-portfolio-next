'use client';

import { useEffect, useState, useCallback } from "react";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { usePortfolioStore, type ProfileData } from "@/store/usePortfolioStore";
import { ImageUpload } from "../../_components/ImageUpload";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormPageSkeleton } from "@/components/admin/FormPageSkeleton";

export function ProfilePageContents() {
  const { profile, fetchProfile, updateProfile } = usePortfolioStore();
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    bio: "",
    longBio: "",
    avatarUrl: "",
    avatarAlt: "",
    resumeUrl: "",
    location: "",
    availability: "",
    email: "",
    whatsapp: "",
    github: "",
    linkedin: "",
    facebook: "",
  });

  useEffect(() => {
    fetchProfile().finally(() => setIsLoading(false));
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        designation: profile.designation || "",
        bio: profile.bio || "",
        longBio: profile.longBio || "",
        avatarUrl: profile.avatarUrl || "",
        avatarAlt: profile.avatarAlt || "",
        resumeUrl: profile.resumeUrl || "",
        location: profile.location || "",
        availability: profile.availability || "",
        email: profile.email || "",
        whatsapp: profile.whatsapp || "",
        github: profile.github || "",
        linkedin: profile.linkedin || "",
        facebook: profile.facebook || "",
      });
    }
  }, [profile]);

  const handleAvatarUrlChange = useCallback((url: string) => {
    setFormData((prev) => ({ ...prev, avatarUrl: url }));
  }, []);

  const handleAvatarAltChange = useCallback((altText: string) => {
    setFormData((prev) => ({ ...prev, avatarAlt: altText }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        name: formData.name,
        designation: formData.designation,
        bio: formData.bio,
        longBio: formData.longBio || null,
        avatarUrl: formData.avatarUrl || null,
        avatarAlt: formData.avatarAlt || null,
        resumeUrl: formData.resumeUrl || null,
        location: formData.location || null,
        availability: formData.availability || null,
        email: formData.email || null,
        whatsapp: formData.whatsapp || null,
        github: formData.github || null,
        linkedin: formData.linkedin || null,
        facebook: formData.facebook || null,
      } as ProfileData);
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <FormPageSkeleton fields={6} hasGridRow />;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Profile"
        description="The single source of truth for your identity and contact info — name, photo, bio, and social links shown everywhere on the site."
      />

      <Card className="border border-border shadow-sm dark:shadow-none rounded-xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-semibold">Name *</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation" className="text-xs font-semibold">Designation *</Label>
                <Input
                  id="designation"
                  type="text"
                  required
                  placeholder="Full-Stack Developer"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-xs font-semibold">Short Bio *</Label>
              <Textarea
                id="bio"
                required
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longBio" className="text-xs font-semibold">Long Bio</Label>
              <Textarea
                id="longBio"
                rows={5}
                value={formData.longBio}
                onChange={(e) => setFormData({ ...formData, longBio: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="resumeUrl" className="text-xs font-semibold">Resume URL (PDF)</Label>
                <Input
                  id="resumeUrl"
                  type="url"
                  value={formData.resumeUrl}
                  onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs font-semibold">Location</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Dhaka, Bangladesh"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability" className="text-xs font-semibold">Availability</Label>
              <Input
                id="availability"
                type="text"
                placeholder="Open to work"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              />
            </div>

            <div className="w-full">
              <ImageUpload
                label="Avatar"
                folder="profile"
                value={formData.avatarUrl}
                onChange={handleAvatarUrlChange}
                alt={formData.avatarAlt}
                onAltChange={handleAvatarAltChange}
              />
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Contact & Social</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email" className="text-xs font-semibold">Public Contact Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-xs font-semibold">WhatsApp (Number or Link)</Label>
                  <Input id="whatsapp" type="text" placeholder="+880 1824975616" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github" className="text-xs font-semibold">GitHub Link</Label>
                  <Input id="github" type="url" value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="text-xs font-semibold">LinkedIn Link</Label>
                  <Input id="linkedin" type="url" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="text-xs font-semibold">Facebook Link</Label>
                  <Input id="facebook" type="url" value={formData.facebook} onChange={(e) => setFormData({ ...formData, facebook: e.target.value })} />
                </div>
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
