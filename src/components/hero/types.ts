export interface HeroBannerData {
  headline?: string;
  subtitle?: string;
  description: string;
  chips: string[];
  ctaLabel?: string;
  ctaHref?: string;
  backgroundTemplate?: string | null;
  layoutTemplate?: string | null;
  animationTemplate?: string | null;
  backgroundImg?: string | null;
  backgroundAlt?: string | null;
  heroImage?: string | null;
  heroImageAlt?: string | null;
  showcaseImageSide?: string | null;
}

export interface HeroProfileData {
  github?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  email?: string | null;
}
