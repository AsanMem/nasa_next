"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Slide = {
    url: string;
    alt: string;
};

export default function EpicSlideshow({ slides }: { slides: Slide[] }) {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        if (!slides || slides.length <= 1) return;

        const id = setInterval(() => {
            setIndex((prev) => (prev + 1) % slides.length);
        }, 2000);
        return () => clearInterval(id);
    }, [slides]);

    if (!slides || slides.length === 0) return null;

    const current = slides[index];

    return (
        <div className="relative h-60 w-full overflow-hidden rounded-2xl bg-white/5">
            <Image
                src={current.url}
                alt={current.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover"
                unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
    );
}
