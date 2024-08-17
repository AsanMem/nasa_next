"use client";
import { useState, useEffect } from "react";

export default function ImageSlideshow({ images }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 1000);

        return () => clearInterval(interval);
    }, [images.length]);

    const currentImage = images[currentImageIndex];
    const [datePart] = currentImage.date.split(" ");
    const formattedDate = datePart.replaceAll("-", "/");

    return (
        <div className=" flex items-center justify-center  ">
            <img
                src={`https://epic.gsfc.nasa.gov/archive/natural/${formattedDate}/png/${currentImage.image}.png`}
                alt={currentImage.caption}
                className="max-w-full object-contain max-h-[80vh] relative"
            />
            <div className="absolute bottom-4 left-4 text-white">
                <h2 className="text-lg font-semibold">{currentImage.caption}</h2>
                <p className="text-sm text-gray-300">{currentImage.date}</p>
            </div>
        </div>
    );
}
