"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Menu() {
    const menuRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(
            menuRef.current,
            {
                y: -100,
                opacity: 0,
            },
            {
                y: 0,
                opacity: 1,
                duration: 1,
                scrollTrigger: {
                    trigger: menuRef.current,
                    start: "top bottom", // когда верх меню касается низа окна
                    end: "top center",   // до середины окна
                    scrub: true,
                    markers: false,
                },
            }
        );
    }, []);

    return (
        <nav ref={menuRef} className="flex justify-center gap-8 py-8 text-white text-2xl drop-shadow-glow">
            <button className="hover:underline">Explore</button>
            <button className="hover:underline">About</button>
            <button className="hover:underline">Contact</button>
        </nav>
    );
}
