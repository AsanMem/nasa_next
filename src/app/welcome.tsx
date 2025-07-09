"use client";
import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RocketScene from "./ui/treejs/scene/RocketScene";
import Menu from "./menu";

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
    const markerRefs = useRef([]);
    const [rocketProgress, setRocketProgress] = useState(0);
    const [activeStage, setActiveStage] = useState(0);


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
            ScrollTrigger.create({
                trigger: section,
                start: "top center",
                end: "bottom center",
                onEnter: () => setActiveStage(i),
                onEnterBack: () => setActiveStage(i),
            });
        });

        imgRefs.current.forEach((img, i) => {
            if (i === 0) return;
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
                        end: "top 85%",
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

        markerRefs.current.forEach((marker, i) => {
            gsap.fromTo(
                marker,
                { scale: 1, filter: "brightness(0.7)" },
                {
                    scale: 1.25,
                    filter: "brightness(1.5)",
                    scrollTrigger: {
                        trigger: sectionRefs.current[i],
                        start: "top center",
                        end: "bottom center",
                        scrub: true,
                    }
                }
            );
        });

        return () => ScrollTrigger.getAll().forEach((t) => t.kill());
    }, []);


    useEffect(() => {
        function onScroll() {
            const firstSection = sectionRefs.current[0];
            const lastSection = sectionRefs.current[sectionRefs.current.length - 1];
            if (!firstSection || !lastSection) return;

            const firstRect = firstSection.getBoundingClientRect();
            const lastRect = lastSection.getBoundingClientRect();

            const firstTop = firstRect.top + window.scrollY;
            const lastTop = lastRect.top + window.scrollY + lastRect.height;

            const centerScreen = window.scrollY + window.innerHeight / 2;
            let progress = (centerScreen - firstTop) / (lastTop - firstTop);
            progress = Math.max(0, Math.min(1, progress));
            setRocketProgress(progress);

            // console.log('SCROLL progress', progress);
        }
        window.addEventListener('scroll', onScroll);
        window.addEventListener('resize', onScroll);
        setTimeout(onScroll, 120);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    const handleStart = () => {
        // TO DO each
    };

    return (
        <div className="relative w-full min-h-screen bg-black">

            {/* BG Images */}
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
                <div
                    className="absolute bottom-0 left-0 w-full h-8 pointer-events-none z-50"
                    style={{
                        background: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0))",
                    }}
                />
            </div>

            {/* PIPELINE */}
            <div className="fixed right-8 top-1/2 z-50 flex flex-col items-center -translate-y-1/2 gap-24" style={{ height: "70vh" }}>
                <div className="w-2 bg-gradient-to-b from-slate-700 to-slate-900 rounded-full h-[70vh] absolute left-1/2 -translate-x-1/2 z-0 opacity-60 "></div>
                {SECTIONS.map((s, i) => (
                    <div
                        key={i}
                        ref={el => (markerRefs.current[i] = el)}
                        className="relative z-10"
                        style={{
                            transition: "filter 0.3s, scale 0.3s"
                        }}
                    >
                        <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400/70 to-indigo-700/80 shadow-lg
                            ${activeStage === i ? "ring-4 ring-blue-400 scale-110" : ""}`}>{i}
                        </div>
                    </div>
                ))}
                <RocketSceneMarker progress={rocketProgress} />
            </div>

            {/* Sections */}
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
                            <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
                                {section.title}
                            </h1>
                            <p className="text-lg md:text-2xl mt-4 drop-shadow">
                                {section.desc}
                            </p>

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
            <Menu />
        </div>
    );
}


const RocketSceneMarker = ({ progress }) => {
    return (
        <div
            style={{
                position: "absolute",
                left: "50%",
                top: `${progress * 100}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 20,
                pointerEvents: "none"
            }}
        >
            <RocketScene />
        </div>
    );
};
