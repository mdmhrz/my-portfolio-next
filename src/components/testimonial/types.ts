export interface TestimonialItem {
  id: string;
  name: string;
  role?: string | null;
  company?: string | null;
  quote: string;
  avatarUrl?: string | null;
  avatarAlt?: string | null;
  rating?: number | null;
  videoUrl?: string | null;
  highlight?: string | null;
  highlightLabel?: string | null;
  order: number;
}

export interface TestimonialsSettings {
  homepageTestimonialsTitle?: string | null;
  homepageTestimonialsSubtitle?: string | null;
  homepageTestimonialsTemplate?: string | null;
  homepageTestimonialsStat?: string | null;
  homepageTestimonialsStatLabel?: string | null;
  homepageTestimonialsCtaText?: string | null;
  homepageTestimonialsCtaLink?: string | null;
}

// Shared props every preset section receives. `preview` renders a static,
// immediately-visible version (no scroll-reveal) for the admin template picker,
// where the section is scaled down inside a clipped box and ScrollTrigger never fires.
export interface TestimonialsSectionProps {
  testimonials: TestimonialItem[];
  settings: TestimonialsSettings;
  preview?: boolean;
}
