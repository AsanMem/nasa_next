"use client";

import Link from "next/link";
import { WelcomeIntro } from "@/app/ui/welcome/WelcomeIntro";
import { SectionTeaser } from "@/app/ui/welcome/SectionTeaser";
import { useRouteIntro } from "@/app/hooks/useRouteIntro";
import { LaunchSheet } from "./ui/welcome/LaunchSheet";
import HeroParallax from "./ui/welcome/HeroParallax";

const SECTIONS = [
    {
        title: "Galaxies",
        description: "Chart luminous clusters, swirling nebulae, and the stories written across distant light-years.",
        href: "/gallery?page=1&query=galaxies",
        background: "/media/main/4.jpg"
    },
    {
        title: "Asteroids",
        description: "Navigate through rugged celestial fragments and uncover data from the asteroid belt.",
        href: "/asteroids",
        background: "/media/main/1.png"
    },
    {
        title: "Missions",
        description: "Follow the critical missions propelling humanity further into the unknown cosmos.",
        href: "/video",
        background: "/media/main/3.jpg"
    },
    {
        title: "Gallery",
        description: "Immerse yourself in curated imagery direct from NASA archives and beyond.",
        href: "/gallery",
        background: "/media/main/2.jpg"
    }
] as const;

export default function Welcome() {
    const { open, variant, close } = useRouteIntro();

    return (
        <div className="relative min-h-screen bg-black text-white">
            {/* <WelcomeIntro open={open} variant={variant} onClose={close} />
            <LaunchSheet show={open} onClose={close} /> */}
            <div className="pb-24">
                <HeroParallax />
            </div>
            <section className="px-6 pb-24">
                <div className="mx-auto max-w-6xl">
                    <p className="text-sm uppercase tracking-[0.5em] text-white/50">Discover</p>
                    <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                        Choose your next cosmic destination
                    </h2>
                    <div className="mt-10 grid gap-6 md:grid-cols-2">
                        {SECTIONS.map((section) => (
                            <SectionTeaser key={section.title} {...section} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
