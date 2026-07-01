'use client';

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, Keyboard, A11y } from "swiper/modules";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/global/Reveal";
import { Button } from "@/components/ui/button";
import {
  renderBlogCard,
  normalizeTemplate,
  type BlogListItem,
} from "@/components/blog";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface HomepageBlogsProps {
  posts: BlogListItem[];
  settings?: {
    homepageBlogVisible?: boolean | null;
    homepageBlogTitle?: string | null;
    homepageBlogSubtitle?: string | null;
    homepageBlogTemplate?: string | null;
  } | null;
}

const DEFAULT_TITLE = "Featured Articles";
const DEFAULT_SUBTITLE = "Notes, deep dives, and lessons from building things on the web.";

export function HomepageBlogs({ posts, settings }: HomepageBlogsProps) {
  const visible = settings?.homepageBlogVisible !== false;
  const template = normalizeTemplate(settings?.homepageBlogTemplate);

  // Hide the section entirely when disabled or when there are no featured posts.
  if (!visible || posts.length === 0) return null;

  const title = settings?.homepageBlogTitle?.trim() || DEFAULT_TITLE;
  const subtitle = settings?.homepageBlogSubtitle?.trim() || DEFAULT_SUBTITLE;

  return (
    <section id="blog" className="relative border-t border-border bg-background px-6 py-28 md:py-40">
      <div className="container mx-auto max-w-7xl">
        <Reveal className="mb-14 flex flex-col gap-4">
          <span className="text-xs font-semibold text-primary">From the blog</span>
          <h2 className="text-4xl font-medium tracking-tight text-foreground md:text-6xl">
            {title}
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {subtitle}
          </p>
        </Reveal>

        <Reveal y={40} delay={0.05} className="homepage-blogs-swiper">
          <Swiper
            modules={[Autoplay, Pagination, Navigation, Keyboard, A11y]}
            slidesPerView={1}
            spaceBetween={24}
            grabCursor
            keyboard={{ enabled: true }}
            pagination={{ clickable: true }}
            navigation
            autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
            loop={posts.length > 1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="!pb-14"
          >
            {posts.map((post) => (
              <SwiperSlide key={post.id} className="h-auto">
                {/* Swiper sets a fixed height on slides by default; we want cards to size to content. */}
                <div className="h-full">{renderBlogCard(post, template)}</div>
              </SwiperSlide>
            ))}
          </Swiper>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex justify-center">
          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link href="/blogs">
              View all articles
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
