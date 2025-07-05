"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SECTIONS = [
    {
        img: "/media/4.jpg",
        title: "Dive into the universe",
        desc: "Explore galaxies, asteroids and incredible worlds!"
    },
    {
        img: "/media/3.jpg",
        title: "Galactic Wonders",
        desc: "Discover mysterious nebulae and star clusters."
    },
    {
        img: "/media/1.jpg",
        title: "Asteroid Belt",
        desc: "Travel through fields of cosmic rocks and marvels."
    },
    {
        img: "/media/2.jpg",
        title: "Infinite Horizons",
        desc: "Let your journey into the unknown begin."
    }
];
export default function Welcome() {
    const imgRefs = useRef([]);
    const sectionRefs = useRef([]);
    const contentRefs = useRef([]);

    useEffect(() => {

        sectionRefs.current.forEach((section, i) => {
            if (!section) return;

            gsap.fromTo(
                imgRefs.current[i],
                { y: "-8%" },
                {
                    y: "8%",
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1.2,
                    },
                }
            );

            gsap.fromTo(
                contentRefs.current[i],
                { opacity: 0, y: 60 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top 70%",
                        end: "top 40%",
                        scrub: 0.5,
                    },
                }
            );
        });


        imgRefs.current.forEach((img, i) => {
            if (i === 0) return; // skip first

            const prevSection = sectionRefs.current[i - 1];
            const currSection = sectionRefs.current[i];


            gsap.fromTo(
                img,
                { opacity: 0 },
                {
                    opacity: 1,
                    ease: "power1.inOut",
                    scrollTrigger: {
                        trigger: currSection,
                        start: "top bottom",
                        end: "top 85%", // adjust for sharper/softer blend
                        scrub: true,
                    },
                }
            );
            gsap.fromTo(
                imgRefs.current[i - 1],
                { opacity: 1 },
                {
                    opacity: 0,
                    ease: "power1.inOut",
                    scrollTrigger: {
                        trigger: currSection,
                        start: "top bottom",
                        end: "top 85%",
                        scrub: true,
                    },
                }
            );
        });

        return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    }, []);

    const handleStart = () => {
        console.log('navigate')
        // TO DO BY EACH SIDE
    };

    return (
        <div className="relative w-full min-h-screen bg-black">
            <div className="fixed inset-0 pointer-events-none z-0">
                {SECTIONS.map((section, i) => (
                    <img
                        ref={(el) => (imgRefs.current[i] = el)}
                        key={i}
                        src={section.img}
                        alt={section.title}
                        className="w-full h-full object-cover absolute inset-0 transition-opacity duration-700 will-change-opacity"
                        style={{ opacity: i === 0 ? 1 : 0 }}
                        draggable={false}
                    />
                ))}

                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
                <div className="absolute bottom-0 left-0 w-full h-8 pointer-events-none z-50"
                    style={{
                        background: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0))"
                    }}
                />
            </div>


            <div>
                {SECTIONS.map((section, i) => (
                    <section
                        key={i}
                        ref={(el) => (sectionRefs.current[i] = el)}
                        className="h-screen flex items-center justify-center relative z-10"
                    >
                        <div
                            ref={(el) => (contentRefs.current[i] = el)}
                            className="relative text-white text-center px-8"
                            style={{ maxWidth: 700 }}
                        >
                            <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">{section.title}</h1>
                            <p className="text-lg md:text-2xl mt-4 drop-shadow">{section.desc}</p>
                            {i === SECTIONS.length - 1 && (
                                <button
                                    onClick={handleStart}
                                    className="mt-8 px-6 py-3 bg-blue-500 rounded-full text-white text-xl font-semibold shadow-lg hover:bg-blue-600 transition"
                                >
                                    Start Exploring
                                </button>
                            )}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}