import Image from 'next/image';

interface BackgroundNoneProps {
  banner?: {
    backgroundImg?: string | null;
    backgroundAlt?: string | null;
  } | null;
}

// No 3D — a flat background color, or a static image if one is set.
export function BackgroundNone({ banner }: BackgroundNoneProps) {
  if (banner?.backgroundImg) {
    return (
      <div aria-hidden className="absolute inset-0">
        <Image
          src={banner.backgroundImg}
          alt={banner.backgroundAlt || ''}
          fill
          priority
          className="object-cover"
        />
      </div>
    );
  }
  return <div aria-hidden className="absolute inset-0 bg-background" />;
}
