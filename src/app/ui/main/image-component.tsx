"use client";
import { useState, useEffect } from "react";
import MainTittle from "../shared/main-tittle";

export default function ImageSlideshow({ images }: any) {
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

    const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;

    return (
        <>
            <MainTittle title={`EPIC Natural Color Images`} description="" classes={`absolute z-10 inset-x-0 ${isMobile && "bottom-52"}`} />
            <div className=" flex justify-center  ">
                <img
                    src={`https://epic.gsfc.nasa.gov/archive/natural/${formattedDate}/png/${currentImage.image}.png`}
                    alt={currentImage.caption}
                    className="relative max-w-full object-contain max-h-[79vh]"
                />
                <div className="absolute bottom-24 text-white text-center">
                    <h2 className="text-lg font-semibold">{currentImage.caption}</h2>
                    <p className="text-sm text-gray-300">{currentImage.date}</p>
                </div>
            </div>
        </>
    );
}
