'use client';

import {
  renderTestimonialsSection,
  normalizeTemplate,
  type TestimonialItem,
  type TestimonialsSettings,
} from "@/components/testimonial";

interface HomepageTestimonialsProps {
  testimonials: TestimonialItem[];
  settings?: TestimonialsSettings | null;
}

export function HomepageTestimonials({
  testimonials,
  settings,
}: HomepageTestimonialsProps) {
  if (testimonials.length === 0) return null;

  const template = normalizeTemplate(settings?.homepageTestimonialsTemplate);

  return renderTestimonialsSection(testimonials, template, settings || {});
}
