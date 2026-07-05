'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Reorder } from 'motion/react';
import { toast } from 'sonner';
import { GripVertical, Star, Check, Plus, Pencil, Trash2 } from 'lucide-react';
import { usePortfolioStore, type TestimonialData } from '@/store/usePortfolioStore';
import {
  renderTestimonialsSection,
  normalizeTemplate,
  TESTIMONIALS_SECTION_TEMPLATES,
  type TestimonialItem,
  type TestimonialsTemplateId,
} from '@/components/testimonial';
import { PageHeader } from '@/components/admin/PageHeader';
import { FormDialog } from '@/components/admin/FormDialog';
import { DeleteDialog } from '@/components/admin/DeleteDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/app/admin/dashboard/_components/ImageUpload';

// Fallback data so every preset preview looks complete even before real
// testimonials are added.
const SAMPLE: TestimonialItem[] = [
  { id: 's1', name: 'Sarah Chen', role: 'Founder', company: 'TechVenture', quote: 'Shipped our MVP faster than we thought possible — clear communication the whole way.', rating: 5, highlight: '8x', highlightLabel: 'Faster delivery', order: 0 },
  { id: 's2', name: 'Marcus Johnson', role: 'CTO', company: 'DataFlow', quote: 'Solid architecture decisions and production-ready code from day one.', rating: 5, highlight: '2x', highlightLabel: 'Team velocity', order: 1 },
  { id: 's3', name: 'Emma Rodriguez', role: 'Product Manager', company: 'CreativeStudio', quote: 'A true problem solver who brought fresh perspective to every challenge.', rating: 5, order: 2 },
  { id: 's4', name: 'David Park', role: 'Engineering Lead', company: 'CloudScale', quote: 'Communicated complex concepts simply. Collaboration felt effortless.', rating: 4, order: 3 },
];

const cardSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().optional(),
  company: z.string().optional(),
  quote: z.string().min(1, 'Quote is required'),
  avatarUrl: z.string().optional(),
  avatarAlt: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  videoUrl: z.string().optional(),
  highlight: z.string().optional(),
  highlightLabel: z.string().optional(),
});

type CardForm = z.infer<typeof cardSchema> & { id?: string };

const emptyCard: CardForm = {
  name: '', role: '', company: '', quote: '',
  avatarUrl: '', avatarAlt: '', rating: 5, videoUrl: '', highlight: '', highlightLabel: '',
};

export function TestimonialsPageContents() {
  const {
    testimonials, fetchTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, reorderTestimonials,
    settings, fetchSettings, updateSettings,
  } = usePortfolioStore();

  const [items, setItems] = useState<TestimonialData[]>([]);

  // Section-level settings (shared by the Content form and the live previews)
  const [section, setSection] = useState({
    homepageTestimonialsTitle: '',
    homepageTestimonialsSubtitle: '',
    homepageTestimonialsTemplate: 'carousel' as TestimonialsTemplateId,
    homepageTestimonialsStat: '',
    homepageTestimonialsStatLabel: '',
    homepageTestimonialsCtaText: '',
    homepageTestimonialsCtaLink: '',
  });
  const [savingSection, setSavingSection] = useState(false);

  // Card dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [card, setCard] = useState<CardForm>(emptyCard);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savingCard, setSavingCard] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTestimonials();
    fetchSettings();
  }, [fetchTestimonials, fetchSettings]);

  useEffect(() => setItems(testimonials), [testimonials]);

  useEffect(() => {
    if (!settings) return;
    setSection({
      homepageTestimonialsTitle: settings.homepageTestimonialsTitle || '',
      homepageTestimonialsSubtitle: settings.homepageTestimonialsSubtitle || '',
      homepageTestimonialsTemplate: normalizeTemplate(settings.homepageTestimonialsTemplate),
      homepageTestimonialsStat: settings.homepageTestimonialsStat || '',
      homepageTestimonialsStatLabel: settings.homepageTestimonialsStatLabel || '',
      homepageTestimonialsCtaText: settings.homepageTestimonialsCtaText || '',
      homepageTestimonialsCtaLink: settings.homepageTestimonialsCtaLink || '',
    });
  }, [settings]);

  const previewData: TestimonialItem[] = items.length >= 3 ? (items as TestimonialItem[]) : SAMPLE;

  // ---- Section settings ----
  const saveSection = async () => {
    setSavingSection(true);
    try {
      await updateSettings(section);
      toast.success('Section settings saved.');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setSavingSection(false);
    }
  };

  const selectTemplate = async (id: TestimonialsTemplateId) => {
    setSection((s) => ({ ...s, homepageTestimonialsTemplate: id }));
    try {
      await updateSettings({ homepageTestimonialsTemplate: id });
      toast.success(`“${TESTIMONIALS_SECTION_TEMPLATES.find((t) => t.id === id)?.label}” selected.`);
    } catch {
      toast.error('Failed to save template.');
    }
  };

  // ---- Cards ----
  const openCreate = () => { setCard(emptyCard); setErrors({}); setDialogOpen(true); };
  const openEdit = (t: TestimonialData) => {
    setCard({
      id: t.id, name: t.name, role: t.role || '', company: t.company || '', quote: t.quote,
      avatarUrl: t.avatarUrl || '', avatarAlt: t.avatarAlt || '', rating: t.rating ?? 5,
      videoUrl: t.videoUrl || '', highlight: t.highlight || '', highlightLabel: t.highlightLabel || '',
    });
    setErrors({});
    setDialogOpen(true);
  };

  const submitCard = async () => {
    const parsed = cardSchema.safeParse(card);
    if (!parsed.success) {
      const e: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { e[i.path[0] as string] = i.message; });
      setErrors(e);
      return;
    }
    setSavingCard(true);
    try {
      if (card.id) await updateTestimonial(card.id, parsed.data);
      else await createTestimonial(parsed.data);
      setDialogOpen(false);
      toast.success(card.id ? 'Testimonial updated.' : 'Testimonial added.');
    } catch {
      toast.error('Failed to save testimonial.');
    } finally {
      setSavingCard(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteTestimonial(deleteId);
      setDeleteId(null);
      toast.success('Testimonial deleted.');
    } catch {
      toast.error('Failed to delete.');
    } finally {
      setDeleting(false);
    }
  };

  const reorder = (next: TestimonialData[]) => {
    setItems(next);
    reorderTestimonials(next).catch(() => toast.error('Failed to save order.'));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Testimonials"
        description="Manage testimonials and pick how the section looks on your homepage."
        action={<Button onClick={openCreate}><Plus className="mr-1.5 h-4 w-4" /> Add Testimonial</Button>}
      />

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="template">Template</TabsTrigger>
        </TabsList>

        {/* ---------------- CONTENT ---------------- */}
        <TabsContent value="content" className="space-y-6">
          {/* Section heading + stat + CTA */}
          <Card className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Section content</h3>
              <Button size="sm" onClick={saveSection} disabled={savingSection}>
                {savingSection ? 'Saving…' : 'Save section'}
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title">
                <Input value={section.homepageTestimonialsTitle} onChange={(e) => setSection({ ...section, homepageTestimonialsTitle: e.target.value })} placeholder="Leave blank for default" />
              </Field>
              <Field label="Subtitle">
                <Input value={section.homepageTestimonialsSubtitle} onChange={(e) => setSection({ ...section, homepageTestimonialsSubtitle: e.target.value })} placeholder="Leave blank for default" />
              </Field>
              <Field label="Stat value" hint="e.g. 10.9K+ — used by Bento & Showcase">
                <Input value={section.homepageTestimonialsStat} onChange={(e) => setSection({ ...section, homepageTestimonialsStat: e.target.value })} placeholder="50+" />
              </Field>
              <Field label="Stat label">
                <Input value={section.homepageTestimonialsStatLabel} onChange={(e) => setSection({ ...section, homepageTestimonialsStatLabel: e.target.value })} placeholder="Projects delivered" />
              </Field>
              <Field label="CTA text">
                <Input value={section.homepageTestimonialsCtaText} onChange={(e) => setSection({ ...section, homepageTestimonialsCtaText: e.target.value })} placeholder="Start a project" />
              </Field>
              <Field label="CTA link">
                <Input value={section.homepageTestimonialsCtaLink} onChange={(e) => setSection({ ...section, homepageTestimonialsCtaLink: e.target.value })} placeholder="/contact" />
              </Field>
            </div>
          </Card>

          {/* Testimonial cards */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Testimonials ({items.length})</h3>
              <p className="text-xs text-muted-foreground">Drag to reorder</p>
            </div>

            {items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No testimonials yet. Click “Add Testimonial” to create one.
              </div>
            ) : (
              <Reorder.Group axis="y" values={items} onReorder={reorder} className="space-y-2">
                {items.map((t) => (
                  <Reorder.Item key={t.id} value={t} className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                    <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/50 active:cursor-grabbing" />
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {t.avatarUrl ? <img src={t.avatarUrl} alt="" className="h-full w-full object-cover" /> : t.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {t.name}
                        {t.role ? <span className="text-muted-foreground"> · {t.role}</span> : null}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{t.quote}</p>
                    </div>
                    {t.rating ? (
                      <span className="hidden shrink-0 items-center gap-0.5 sm:flex">
                        {[...Array(t.rating)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />)}
                      </span>
                    ) : null}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(t.id)}><Trash2 className="h-4 w-4" /></Button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </Card>
        </TabsContent>

        {/* ---------------- TEMPLATE ---------------- */}
        <TabsContent value="template" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Pick a design — the preview shows the exact section that renders on your homepage, using your real testimonials.
          </p>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {TESTIMONIALS_SECTION_TEMPLATES.map((tpl) => {
              const selected = section.homepageTestimonialsTemplate === tpl.id;
              return (
                <div
                  key={tpl.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  onClick={() => selectTemplate(tpl.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectTemplate(tpl.id);
                    }
                  }}
                  className={`group cursor-pointer overflow-hidden rounded-xl border-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary ${
                    selected ? 'border-primary' : 'border-border hover:border-muted-foreground/50'
                  }`}
                >
                  {/* Scaled live preview */}
                  <div className="relative h-64 overflow-hidden bg-background">
                    <div className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ width: 1280, transform: 'scale(0.33)' }}>
                      {renderTestimonialsSection(previewData, tpl.id, section, true)}
                    </div>
                    {selected && (
                      <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-3 border-t border-border p-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{tpl.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{tpl.description}</p>
                    </div>
                    {selected && <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">Active</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Card dialog */}
      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={card.id ? 'Edit Testimonial' : 'Add Testimonial'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitCard} disabled={savingCard}>{savingCard ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name *" error={errors.name}>
            <Input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Client name" />
          </Field>
          <Field label="Role">
            <Input value={card.role} onChange={(e) => setCard({ ...card, role: e.target.value })} placeholder="e.g. CEO" />
          </Field>
          <Field label="Company">
            <Input value={card.company} onChange={(e) => setCard({ ...card, company: e.target.value })} placeholder="Company" />
          </Field>
          <Field label="Rating">
            <div className="flex gap-1 pt-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setCard({ ...card, rating: card.rating === n ? 0 : n })}>
                  <Star className={`h-6 w-6 ${(card.rating || 0) >= n ? 'fill-primary text-primary' : 'text-muted-foreground/40'}`} />
                </button>
              ))}
            </div>
          </Field>
        </div>

        <Field label="Quote *" error={errors.quote}>
          <Textarea rows={4} value={card.quote} onChange={(e) => setCard({ ...card, quote: e.target.value })} placeholder="What did they say?" />
        </Field>

        <ImageUpload
          label="Avatar"
          folder="testimonials"
          previewClassName="aspect-square max-w-[8rem]"
          objectFit="cover"
          value={card.avatarUrl || ''}
          onChange={(url) => setCard({ ...card, avatarUrl: url })}
          alt={card.avatarAlt || ''}
          onAltChange={(alt) => setCard({ ...card, avatarAlt: alt })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Highlight" hint="Bento stat, e.g. 8x">
            <Input value={card.highlight} onChange={(e) => setCard({ ...card, highlight: e.target.value })} placeholder="8x" />
          </Field>
          <Field label="Highlight label">
            <Input value={card.highlightLabel} onChange={(e) => setCard({ ...card, highlightLabel: e.target.value })} placeholder="Increase in conversion" />
          </Field>
        </div>
        <Field label="Video URL" hint="Optional — shows a video card in the Carousel preset">
          <Input value={card.videoUrl} onChange={(e) => setCard({ ...card, videoUrl: e.target.value })} placeholder="https://…" />
        </Field>
      </FormDialog>

      <DeleteDialog
        open={deleteId !== null}
        onOpenChange={(o) => { if (!o) setDeleteId(null); }}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete testimonial"
        description="This permanently removes the testimonial. This action cannot be undone."
      />
    </div>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-foreground">
        {label}
        {hint && <span className="ml-1.5 font-normal text-muted-foreground">— {hint}</span>}
      </span>
      {children}
      {error && <span className="block text-xs text-destructive">{error}</span>}
    </label>
  );
}
