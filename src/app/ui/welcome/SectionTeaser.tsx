"use client";

import Link from "next/link";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/app/hooks/usePrefersReducedMotion";

type SectionTeaserProps = {
  title: string;
  description: string;
  href: string;
  background: string;
};

export function SectionTeaser({ title, description, href, background }: SectionTeaserProps) {
  const cardRef = useRef<HTMLAnchorElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const card = cardRef.current;

    if (!card) {
      return;
    }

    if (!prefersReducedMotion) {
      gsap.registerPlugin(ScrollTrigger);
    }

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        gsap.set(card, { opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap.set(card, { opacity: 0, y: 32, scale: 0.96 });

      gsap.to(card, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });
    }, cardRef);

    return () => {
      ctx.revert();
    };
  }, [prefersReducedMotion]);

  return (
    <Link
      ref={cardRef}
      href={href}
      className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-black/60 p-8 text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      style={{ opacity: 0, transform: "translateY(32px) scale(0.96)" }}
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src={background}
          alt=""
          fill
          className="pointer-events-none object-cover opacity-70 transition duration-500 group-hover:opacity-90"
          sizes="(min-width: 1024px) 25vw, 100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/70" />
      </div>
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">Featured</p>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h3>
          <p className="mt-4 max-w-md text-base text-white/80">
            {description}
          </p>
        </div>
        <span className="mt-10 inline-flex items-center text-sm font-semibold uppercase tracking-[0.35em] text-blue-300 transition group-hover:text-blue-200">
          Explore
        </span>
      </div>
    </Link>
  );
}
