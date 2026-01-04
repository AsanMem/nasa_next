"use client";

import { useState, useEffect, useMemo } from "react";

type EpicImage = {
    imageUrl?: string;
    caption?: string;
    date?: string;
};

export default function ImageSlideshow({ images }: { images: EpicImage[] }) {
    const safeImages = useMemo(
        () =>
            Array.isArray(images)
                ? images.filter((img) => img && img.imageUrl)
                : [],
        [images],
    );

    const [currentIndex, setCurrentIndex] = useState(0);


    useEffect(() => {
        setCurrentIndex(0);
    }, [safeImages.length]);


    useEffect(() => {
        if (safeImages.length <= 1) return;

        const id = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % safeImages.length);
        }, 3500);

        return () => clearInterval(id);
    }, [safeImages.length]);

    if (!safeImages.length) {
        return <p>No images available</p>;
    }

    const current = safeImages[currentIndex];

    return (
        <div className="flex justify-center">
            <div className="flex justify-center">
                <div className="flex flex-col items-center">
                    <img
                        src={current.imageUrl as string}
                        alt={current.caption ?? "EPIC Earth image"}
                        className="max-w-full object-contain max-h-[79vh]"
                    />

                    <div className="mt-4 text-gray-300 text-center">
                        <h2 className="text-sm font-semibold">
                            {current.caption ?? "EPIC Earth image"}
                        </h2>
                        <p className=" text-gray-300">{current.date}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
