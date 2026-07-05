'use client';

import { useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, Keyboard, A11y } from "swiper/modules";
import { ChevronLeft, ChevronRight, Play, Quote } from "lucide-react";
import { SectionReveal } from "./SectionReveal";
import type { TestimonialsSectionProps } from "./types";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const DEFAULT_TITLE = "Don't just take my word for it.";
const DEFAULT_SUBTITLE = "Hear it from the teams and founders I've built with.";

export function TestimonialsCarousel({
  testimonials,
  settings,
  preview = false,
}: TestimonialsSectionProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  if (testimonials.length === 0) return null;

  const title = settings?.homepageTestimonialsTitle?.trim() || DEFAULT_TITLE;
  const subtitle = settings?.homepageTestimonialsSubtitle?.trim() || DEFAULT_SUBTITLE;

  return (
    <section id="testimonials" className="relative border-t border-border bg-background px-6 py-28 md:py-40">
      <div className="container mx-auto max-w-7xl">
        <SectionReveal preview={preview} className="mb-14 flex flex-col gap-5">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Testimonials
          </span>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-3xl text-4xl font-medium leading-[1.05] tracking-tight text-foreground md:text-6xl">
              {title}
              <br />
              <span className="text-muted-foreground">{subtitle}</span>
            </h2>
            <div className="flex gap-3">
              <button
                ref={prevRef}
                type="button"
                aria-label="Previous testimonial"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-primary hover:border-primary hover:text-primary-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                ref={nextRef}
                type="button"
                aria-label="Next testimonial"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-primary hover:border-primary hover:text-primary-foreground"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </SectionReveal>

        <SectionReveal preview={preview}>
          <Swiper
            modules={[Autoplay, Pagination, Navigation, Keyboard, A11y]}
            slidesPerView={1}
            spaceBetween={24}
            grabCursor
            keyboard={{ enabled: true }}
            pagination={{ clickable: true }}
            navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
            onInit={(swiper) => {
              if (prevRef.current && nextRef.current && swiper.params.navigation && typeof swiper.params.navigation !== "boolean") {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
                swiper.navigation.init();
                swiper.navigation.update();
              }
            }}
            autoplay={preview ? false : { delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
            loop={!preview && testimonials.length > 3}
            breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
            className="!pb-16"
          >
            {testimonials.map((t) => {
              const hasVideo = Boolean(t.videoUrl);
              return (
                <SwiperSlide key={t.id} className="h-auto">
                  <article
                    className={
                      hasVideo
                        ? "group relative flex h-full min-h-[26rem] flex-col justify-between overflow-hidden rounded-2xl border border-border"
                        : "flex h-full min-h-[26rem] flex-col justify-between rounded-2xl border border-border bg-card p-8"
                    }
                  >
                    {hasVideo && t.avatarUrl && (
                      <Image
                        src={t.avatarUrl}
                        alt={t.avatarAlt || t.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover"
                      />
                    )}
                    {hasVideo && (
                      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    )}

                    {/* Top row: avatar (or video play button) */}
                    <div className="relative flex items-center justify-between">
                      {!hasVideo && (
                        <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                          {t.avatarUrl ? (
                            <Image src={t.avatarUrl} alt={t.avatarAlt || t.name} width={48} height={48} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-sm font-semibold text-muted-foreground">{t.name.charAt(0)}</span>
                          )}
                        </span>
                      )}
                      {!hasVideo && <Quote className="h-7 w-7 text-primary/30" />}
                      {hasVideo && (
                        <a
                          href={t.videoUrl || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute left-1/2 top-24 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-lg transition-transform group-hover:scale-110"
                          aria-label={`Play ${t.name}'s video testimonial`}
                        >
                          <Play className="h-6 w-6 translate-x-0.5 fill-current" />
                        </a>
                      )}
                    </div>

                    {/* Quote (hidden on video cards, which lead with imagery) */}
                    {!hasVideo && (
                      <p className="relative mt-6 flex-1 text-base leading-relaxed text-foreground">
                        “{t.quote}”
                      </p>
                    )}

                    {/* Author */}
                    <div className={hasVideo ? "relative mt-auto" : "relative mt-8"}>
                      <p className={`font-serif text-xl italic ${hasVideo ? "text-white" : "text-foreground"}`}>
                        {t.name}
                      </p>
                      {(t.role || t.company) && (
                        <p className={`mt-1 text-sm ${hasVideo ? "text-white/70" : "text-muted-foreground"}`}>
                          {[t.role, t.company].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                  </article>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </SectionReveal>
      </div>
    </section>
  );
}
