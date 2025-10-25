"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/app/hooks/usePrefersReducedMotion";

type WelcomeIntroProps = {
    open: boolean;
    onClose: () => void;
    variant: "full" | "short";
};

const PANEL_VARIANTS = {
    full: {
        heading: "Welcome, Explorer",
        body: "Calibrate your senses and prepare for a journey that spans galaxies, asteroids, and the missions that connect them.",
        subline: "Scroll to discover what awaits you beyond the horizon."
    },
    short: {
        heading: "Ready for Launch",
        body: "Quick systems check complete. Dive back into the universe whenever you are ready.",
        subline: "Scroll to continue."
    }
} as const;

const SKIP_LABEL = "Skip";

export function WelcomeIntro({ open, onClose, variant }: WelcomeIntroProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const content = useMemo(() => PANEL_VARIANTS[variant], [variant]);
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        let isCancelled = false;

        const refreshTriggers = () => {
            if (!isCancelled) {
                ScrollTrigger.refresh();
            }
        };

        const docWithFonts = document as Document & { fonts?: FontFaceSet };

        docWithFonts.fonts?.ready
            .then(refreshTriggers)
            .catch(() => undefined);

        window.addEventListener("load", refreshTriggers);

        return () => {
            isCancelled = true;
            window.removeEventListener("load", refreshTriggers);
        };
    }, []);

    useLayoutEffect(() => {
        const node = containerRef.current;

        if (!node) {
            return;
        }

        const ctx = gsap.context(() => {
            const targets = {
                panel: "[data-anim=panel]",
                headline: "[data-anim=headline]",
                copy: "[data-anim=copy]",
                skip: "[data-anim=skip]"
            } as const;

            if (!open) {
                gsap.set(node, { opacity: 0 });
                gsap.set([targets.panel, targets.headline, targets.copy, targets.skip], {
                    opacity: 0,
                    y: (index) => (index === 0 ? 24 : 16)
                });
                return;
            }

            gsap.registerPlugin(ScrollTrigger);

            if (prefersReducedMotion) {
                gsap.set(node, { opacity: 1 });
                gsap.set([targets.panel, targets.headline, targets.copy, targets.skip], { opacity: 1, y: 0 });
                return;
            }

            const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

            tl.to(node, { opacity: 1, duration: 0.5 });
            tl.to(targets.panel, { opacity: 1, y: 0, duration: 0.7 }, "<");
            tl.to(targets.headline, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
            tl.to(targets.copy, { opacity: 1, y: 0, duration: 0.45 }, "-=0.25");
            tl.to(targets.skip, { opacity: 1, y: 0, duration: 0.35 }, "-=0.2");
        }, containerRef);

        return () => {
            ctx.revert();
        };
    }, [open, prefersReducedMotion, variant]);

    const hidden = !open;
    const containerClassName = "fixed inset-0 z-50 flex items-center justify-center px-6 py-12";

    return (
        <div
            ref={containerRef}
            className={containerClassName}
            style={{ opacity: 0 }}
            aria-hidden={hidden}
            data-open={open}
        >
            <div
                data-anim="panel"
                className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/15 bg-black/65 p-10 text-white shadow-2xl backdrop-blur"
                style={{ opacity: 0, transform: "translateY(24px)" }}
            >
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-transparent opacity-60" />
                <div data-anim="headline" style={{ opacity: 0, transform: "translateY(16px)" }}>
                    <p className="text-sm uppercase tracking-[0.4em] text-blue-300/80">NASA Next</p>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                        {content.heading}
                    </h1>
                </div>
                <div data-anim="copy" style={{ opacity: 0, transform: "translateY(16px)" }}>
                    <p className="mt-6 text-base text-white/80 sm:text-lg">
                        {content.body}
                    </p>
                    <p className="mt-4 text-sm uppercase tracking-[0.3em] text-white/60">
                        {content.subline}
                    </p>
                </div>
                <div className="mt-10 flex items-center justify-end">
                    <button
                        type="button"
                        data-anim="skip"
                        onClick={onClose}
                        className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2 text-sm font-medium uppercase tracking-wide text-white transition hover:border-white/60 hover:bg-white/10"
                        style={{ opacity: 0, transform: "translateY(12px)" }}
                    >
                        {SKIP_LABEL}
                    </button>
                </div>
            </div>
        </div>
    );
}
