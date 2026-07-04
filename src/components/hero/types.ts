export interface HeroBannerData {
  description: string;
  chips: string[];
  backgroundTemplate?: string | null;
  layoutTemplate?: string | null;
  animationTemplate?: string | null;
  backgroundImg?: string | null;
  backgroundAlt?: string | null;
  heroImage?: string | null;
  heroImageAlt?: string | null;
}

export interface HeroProfileData {
  name: string;
  designation: string;
  github?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  email?: string | null;
}
