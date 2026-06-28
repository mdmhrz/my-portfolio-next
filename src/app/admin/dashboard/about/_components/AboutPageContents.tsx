'use client';

import { useEffect, useState, useCallback } from "react";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { usePortfolioStore, type AboutData } from "@/store/usePortfolioStore";
import { ImageUpload } from "../../_components/ImageUpload";

export function AboutPageContents() {
  const { about, fetchAbout, updateAbout } = usePortfolioStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    longBio: "",
    resumeUrl: "",
    avatarUrl: "",
    avatarAlt: "",
    location: "",
    availability: "",
  });

  useEffect(() => {
    fetchAbout();
  }, [fetchAbout]);

  useEffect(() => {
    if (about) {
      setFormData({
        bio: about.bio || "",
        longBio: about.longBio || "",
        resumeUrl: about.resumeUrl || "",
        avatarUrl: about.avatarUrl || "",
        avatarAlt: about.avatarAlt || "",
        location: about.location || "",
        availability: about.availability || "",
      });
    }
  }, [about]);

  const handleAvatarUrlChange = useCallback((url: string) => {
    setFormData(prev => ({ ...prev, avatarUrl: url }));
  }, []);

  const handleAvatarAltChange = useCallback((altText: string) => {
    setFormData(prev => ({ ...prev, avatarAlt: altText }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateAbout({
        bio: formData.bio,
        longBio: formData.longBio || null,
        resumeUrl: formData.resumeUrl || null,
        avatarUrl: formData.avatarUrl || null,
        avatarAlt: formData.avatarAlt || null,
        location: formData.location || null,
        availability: formData.availability || null,
      } as AboutData);
      toast.success("About section saved!");
    } catch (err) {
      toast.error("Failed to save about section.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-medium tracking-tight">About</h1>
        <p className="text-sm text-muted-foreground">Your bio, resume link, avatar, and availability shown across the site.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bio" className="font-mono text-[10px] uppercase tracking-wider font-semibold">Short Bio *</Label>
              <Textarea
                id="bio"
                required
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longBio" className="font-mono text-[10px] uppercase tracking-wider font-semibold">Long Bio</Label>
              <Textarea
                id="longBio"
                rows={5}
                value={formData.longBio}
                onChange={(e) => setFormData({ ...formData, longBio: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="resumeUrl" className="font-mono text-[10px] uppercase tracking-wider">Resume URL (PDF)</Label>
                <Input
                  id="resumeUrl"
                  type="url"
                  value={formData.resumeUrl}
                  onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="font-mono text-[10px] uppercase tracking-wider">Location</Label>
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
              <Label htmlFor="availability" className="font-mono text-[10px] uppercase tracking-wider">Availability</Label>
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
                folder="about"
                value={formData.avatarUrl}
                onChange={handleAvatarUrlChange}
                alt={formData.avatarAlt}
                onAltChange={handleAvatarAltChange}
              />
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
