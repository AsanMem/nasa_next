'use client';

import Pagination from '../shared/pagination';
import CardTopic from './card-topic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

interface ListImagesProps {
  gallery: any[];
  totalPages: number;
}

export default function ListImages({ gallery, totalPages }: ListImagesProps) {
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = gsap.utils.toArray<HTMLDivElement>('.cardTopic');

    cards.forEach((card) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            end: 'top 30%',
            scrub: false,
            toggleActions: 'play none none reverse',
          },
        },
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  if (!gallery || gallery.length === 0) {
    return (
      <div className="text-readable rounded-3xl bg-white/5 p-6 text-center text-white/60 ring-1 ring-white/10">
        Space imagery is cooling off right now. Try a different search query.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div ref={cardsRef} className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {gallery.map((img: any, i: number) => (
          <CardTopic topic={img} key={img.data[0].title + i} />
        ))}
      </div>
      {totalPages > 1 ? (
        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      ) : null}
    </div>
  );
}
