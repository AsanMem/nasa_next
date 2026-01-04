"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Pagination from "../shared/pagination";
import CardVideo from "./card-video";

gsap.registerPlugin(ScrollTrigger);

type VideoItem = {
  data: Array<{
    title?: string;
    description?: string;
    keywords?: string[];
  }>;
  links?: Array<{
    href?: string;
  }>;
  videoUrl?: string | null;
};

interface ListVideosProps {
  videos: VideoItem[];
  totalPages: number;
  query: string;
}

export default function ListVideos({ videos, totalPages, query }: ListVideosProps) {
  const cardsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!cardsRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLDivElement>(".cardVideo");

      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              end: "top 30%",
              scrub: false,
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, cardsRef);

    return () => ctx.revert();
  }, [videos]);
  if (!videos || videos.length === 0) {
    return (
      <div className="rounded-3xl bg-white/5 p-6 text-center text-white/60 ring-1 ring-white/10">
        No NASA videos match this search yet. Try refining your keywords.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div ref={cardsRef} className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {videos.map((video, i) => {
          const data = video?.data?.[0];
          const preview = video?.links?.[0]?.href;

          return (
            <div className="cardVideo" key={(data?.title ?? "nasa-video") + i}>
              <CardVideo
                videoPreview={preview ?? ""}
                videoPlay={video?.videoUrl ?? ""}
                title={data?.title ?? "NASA video"}
                description={data?.description ?? ""}
                keywords={data?.keywords}
              />
            </div>
          );
        })}
      </div>

      {totalPages > 1 ? (
        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      ) : null}
    </div>
  );
}
