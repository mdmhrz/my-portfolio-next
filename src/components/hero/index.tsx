'use client';

import type { RefObject } from 'react';
import nextDynamic from 'next/dynamic';
import type { HeroBannerData, HeroProfileData } from './types';
import { BackgroundNone } from './backgrounds/BackgroundNone';
import { LayoutSignature } from './layouts/LayoutSignature';
import { LayoutShowcase } from './layouts/LayoutShowcase';
import { LayoutCentered } from './layouts/LayoutCentered';
import { useSignatureAnimation } from './animations/useSignatureAnimation';
import { useFadeAnimation } from './animations/useFadeAnimation';

// WebGL/Three.js backgrounds never ship to the server bundle.
const BackgroundLattice = nextDynamic(
  () => import('./backgrounds/BackgroundLattice').then((m) => m.BackgroundLattice),
  { ssr: false, loading: () => null },
);
const BackgroundParticles = nextDynamic(
  () => import('./backgrounds/BackgroundParticles').then((m) => m.BackgroundParticles),
  { ssr: false, loading: () => null },
);
const BackgroundWave = nextDynamic(
  () => import('./backgrounds/BackgroundWave').then((m) => m.BackgroundWave),
  { ssr: false, loading: () => null },
);
const BackgroundGravity = nextDynamic(
  () => import('./backgrounds/BackgroundGravity').then((m) => m.BackgroundGravity),
  { ssr: false, loading: () => null },
);
const BackgroundConstellation = nextDynamic(
  () => import('./backgrounds/BackgroundConstellation').then((m) => m.BackgroundConstellation),
  { ssr: false, loading: () => null },
);

export type { HeroBannerData, HeroProfileData } from './types';

export type BackgroundTemplateId = 'none' | 'lattice' | 'particles' | 'wave' | 'gravity' | 'constellation';
export type LayoutTemplateId = 'signature' | 'showcase' | 'centered';
export type AnimationTemplateId = 'signature' | 'fade';

export interface BackgroundTemplateMeta {
  id: BackgroundTemplateId;
  label: string;
  description: string;
}

export interface LayoutTemplateMeta {
  id: LayoutTemplateId;
  label: string;
  description: string;
}

export interface AnimationTemplateMeta {
  id: AnimationTemplateId;
  label: string;
  description: string;
}

export const BACKGROUND_TEMPLATES: BackgroundTemplateMeta[] = [
  { id: 'none', label: 'None', description: 'Solid background color, or a static image if you set one.' },
  { id: 'lattice', label: 'Lattice', description: 'A 3D point-grid environment that tilts and repels around your cursor.' },
  { id: 'particles', label: 'Particles', description: 'A drifting field of soft glowing dust, with gentle mouse parallax.' },
  { id: 'wave', label: 'Wave', description: 'A rolling horizon of glowing light-points that shimmer brighter at each crest.' },
  { id: 'gravity', label: 'Gravity', description: 'A swarm of particles orbiting a gravity well that follows your cursor.' },
  { id: 'constellation', label: 'Constellation', description: 'Drifting nodes that connect with light whenever they pass close together.' },
];

export const LAYOUT_TEMPLATES: LayoutTemplateMeta[] = [
  { id: 'signature', label: 'Signature', description: 'Two-column split: identity and copy on the left, a live code card on the right.' },
  { id: 'showcase', label: 'Showcase', description: 'Mirrored split led by your name, with a showcase image instead of the code card.' },
  { id: 'centered', label: 'Centered', description: 'A single centered column — no code card or image, just the words.' },
];

export const ANIMATION_TEMPLATES: AnimationTemplateMeta[] = [
  { id: 'signature', label: 'Signature', description: 'Magnetic cursor letters, character-by-character reveal, underline draw-in, and 3D tilt.' },
  { id: 'fade', label: 'Fade', description: 'A calmer fade + slide-up stagger, no cursor interactivity.' },
];

export interface PremadeTemplate {
  id: string;
  label: string;
  description: string;
  background: BackgroundTemplateId;
  layout: LayoutTemplateId;
  animation: AnimationTemplateId;
}

/**
 * Named shortcuts that set all three axes at once. This is the only place a
 * "template" as a whole concept exists — everywhere else, background/layout/
 * animation are independent selections. Add more entries here as new
 * combinations are worth naming; it never requires touching the axis code.
 */
export const PREMADE_TEMPLATES: PremadeTemplate[] = [
  {
    id: 'template-1',
    label: 'Template 1 — Signature',
    description: 'The original look: Lattice background, split layout with a live code card, magnetic-letter animation.',
    background: 'lattice',
    layout: 'signature',
    animation: 'signature',
  },
  {
    id: 'template-2',
    label: 'Template 2 — Nebula Showcase',
    description: 'Drifting Particles background, mirrored layout led by your name and a showcase image, calm fade-in.',
    background: 'particles',
    layout: 'showcase',
    animation: 'fade',
  },
  {
    id: 'template-3',
    label: 'Template 3 — Horizon Minimal',
    description: 'Rolling Wave background, single centered column with no code card or image, calm fade-in.',
    background: 'wave',
    layout: 'centered',
    animation: 'fade',
  },
];

export function normalizeBackground(value?: string | null): BackgroundTemplateId {
  return value === 'lattice' || value === 'particles' || value === 'wave' || value === 'gravity' || value === 'constellation'
    ? value
    : 'none';
}

export function normalizeLayout(value?: string | null): LayoutTemplateId {
  return value === 'showcase' || value === 'centered' ? value : 'signature';
}

export function normalizeAnimation(value?: string | null): AnimationTemplateId {
  return value === 'fade' ? value : 'signature';
}

export function renderHeroBackground(
  type: BackgroundTemplateId,
  props: { reduced: boolean; banner?: HeroBannerData | null },
) {
  switch (type) {
    case 'lattice':
      return <BackgroundLattice reduced={props.reduced} />;
    case 'particles':
      return <BackgroundParticles reduced={props.reduced} />;
    case 'wave':
      return <BackgroundWave reduced={props.reduced} />;
    case 'gravity':
      return <BackgroundGravity reduced={props.reduced} />;
    case 'constellation':
      return <BackgroundConstellation reduced={props.reduced} />;
    case 'none':
    default:
      return <BackgroundNone banner={props.banner} />;
  }
}

export function renderHeroLayout(
  type: LayoutTemplateId,
  props: { start: boolean; fullHeight: boolean; banner?: HeroBannerData | null; profile?: HeroProfileData | null },
) {
  switch (type) {
    case 'showcase':
      return <LayoutShowcase start={props.start} fullHeight={props.fullHeight} banner={props.banner} profile={props.profile} />;
    case 'centered':
      return <LayoutCentered start={props.start} fullHeight={props.fullHeight} banner={props.banner} profile={props.profile} />;
    case 'signature':
    default:
      return <LayoutSignature start={props.start} fullHeight={props.fullHeight} banner={props.banner} profile={props.profile} />;
  }
}

/**
 * Each animation variant is its own hook, called unconditionally every
 * render (Rules of Hooks) and self-gated by `enabled` so only the currently
 * selected one actually sets anything up. Add new variants by adding another
 * `useXAnimation(sectionRef, { ...opts, enabled: type === 'x' })` line here.
 */
export function useHeroAnimation(
  type: AnimationTemplateId,
  sectionRef: RefObject<HTMLElement | null>,
  opts: { start: boolean; reduced: boolean },
) {
  useSignatureAnimation(sectionRef, { ...opts, enabled: type === 'signature' });
  useFadeAnimation(sectionRef, { ...opts, enabled: type === 'fade' });
}
