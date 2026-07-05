import { TestimonialsCarousel } from "./TestimonialsCarousel";
import { TestimonialsArc } from "./TestimonialsArc";
import { TestimonialsBento } from "./TestimonialsBento";
import { TestimonialsShowcase } from "./TestimonialsShowcase";
import { TestimonialsSpotlight } from "./TestimonialsSpotlight";
import type { TestimonialItem, TestimonialsSettings } from "./types";

export type { TestimonialItem, TestimonialsSettings } from "./types";
export {
  TestimonialsCarousel,
  TestimonialsArc,
  TestimonialsBento,
  TestimonialsShowcase,
  TestimonialsSpotlight,
};

export type TestimonialsTemplateId = "carousel" | "arc" | "bento" | "showcase" | "spotlight";

export interface TestimonialsTemplateMeta {
  id: TestimonialsTemplateId;
  label: string;
  description: string;
}

export const TESTIMONIALS_SECTION_TEMPLATES: TestimonialsTemplateMeta[] = [
  {
    id: "carousel",
    label: "Carousel Cards",
    description: "Sliding cards with signature-style names — great for longer written quotes.",
  },
  {
    id: "arc",
    label: "Arc Spotlight",
    description: "Avatars on a curved arc with one large auto-rotating quote in focus.",
  },
  {
    id: "bento",
    label: "Bento Stats",
    description: "A results-driven bento grid mixing metric highlights and short reviews.",
  },
  {
    id: "showcase",
    label: "Showcase + CTA",
    description: "Big stat tile beside chat-bubble reviews, with a call-to-action banner.",
  },
  {
    id: "spotlight",
    label: "Spotlight Card",
    description: "Featured portrait card with a speech-bubble quote and thumbnail switcher.",
  },
];

export function normalizeTemplate(value: unknown): TestimonialsTemplateId {
  return value === "arc" || value === "bento" || value === "showcase" || value === "spotlight"
    ? (value as TestimonialsTemplateId)
    : "carousel";
}

export function renderTestimonialsSection(
  testimonials: TestimonialItem[],
  template: TestimonialsTemplateId,
  settings: TestimonialsSettings,
  preview = false
) {
  const props = { testimonials, settings, preview };
  switch (template) {
    case "arc":
      return <TestimonialsArc {...props} />;
    case "bento":
      return <TestimonialsBento {...props} />;
    case "showcase":
      return <TestimonialsShowcase {...props} />;
    case "spotlight":
      return <TestimonialsSpotlight {...props} />;
    case "carousel":
    default:
      return <TestimonialsCarousel {...props} />;
  }
}
