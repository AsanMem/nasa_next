
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Welcome() {
    const imgRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(
            imgRef.current,
            {
                scale: 1,
                opacity: 0.7,
            },
            {
                scale: 2,
                opacity: 1,
                scrollTrigger: {
                    trigger: imgRef.current,
                    start: "top center",
                    end: "bottom top",
                    scrub: true,
                    markers: false,
                },
            }
        );
    }, []);

    return (
        <div className="relative">
            <img
                ref={imgRef}
                src="/media/2.jpg"
                alt="Space"
                className="w-full h-auto object-cover"
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-4xl">
                <h1>Dive into the universe</h1>
                <p>Explore galaxies, asteroids and incredible worlds!</p>
            </div>
        </div>
    );
}