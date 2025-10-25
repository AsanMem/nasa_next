"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePrefersReducedMotion } from "@/app/hooks/usePrefersReducedMotion";

gsap.registerPlugin(ScrollTrigger);

const VIDEO_URL =
    "https://firebasestorage.googleapis.com/v0/b/nasa-odisey.appspot.com/o/media%2Fvideos%2FISS071-E-226528-227449-20240625-Night.mp4?alt=media&token=b1936d11-9e58-471b-b4a7-df92c16653f9";
const SAFE_VIDEO_URL = VIDEO_URL.replace(/\\\?/g, "?");
console.log('[VIDEO_URL]', SAFE_VIDEO_URL);
type Layer = {
    id: string;
    z: number;            // глубина (чем больше, тем ближе)
    opacity?: number;
    yScroll?: number;     // амплитуда вертикального сдвига от скролла (px)
    tilt?: number;        // чувствительность к курсору/наклону
    maskBottomVH?: number;
    saturate?: number;
    brightness?: number;
    blur?: number;
};

const VIDEO_LAYER: Layer = {
    id: "video",
    z: -60,
    opacity: 1,
    yScroll: 60,
    tilt: 1.8,
    // maskBottomVH: 0,
};

function mapRange(
    x: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
) {
    return ((x - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export default function HeroParallax(): JSX.Element {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const sceneRef = useRef<HTMLDivElement | null>(null);
    const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const prefersReduced = usePrefersReducedMotion();

    // массив слоёв  для совместимости с логикой
    const layers = useMemo(() => [VIDEO_LAYER], []);

    useLayoutEffect(() => {
        const root = rootRef.current;
        const scene = sceneRef.current;
        if (!root || !scene) return;

        scene.style.transformStyle = "preserve-3d";

        const ctx = gsap.context(() => {
            // Режим «меньше анимации»: без скролл-сдвигов/наклонов
            if (prefersReduced) {
                layerRefs.current.forEach((node, i) => {
                    const l = layers[i];
                    if (!node || !l) return;
                    gsap.set(node, {
                        opacity: l.opacity ?? 1,
                        y: 0,
                        transform: `translateZ(${l.z}px)`,
                    });
                });
                return;
            }

            // Плавная проявка + лёгкий подъезд к своей Z-позиции
            layerRefs.current.forEach((node, i) => {
                const l = layers[i];
                if (!node || !l) return;

                const initialY = -Math.min(40, (l.yScroll ?? 40) * 0.35);
                const safeScale = 1 + Math.max(0, (l.z + 300) / 1200);

                gsap.set(node, {
                    opacity: 0,
                    y: initialY,
                    transform: `translateZ(${l.z}px) scale(${safeScale})`,
                    filter: [
                        l.blur ? `blur(${l.blur}rem)` : "",
                        l.saturate ? `saturate(${l.saturate})` : "",
                        l.brightness ? `brightness(${l.brightness})` : "",
                    ]
                        .filter(Boolean)
                        .join(" "),
                });

                gsap.to(node, {
                    opacity: l.opacity ?? 1,
                    y: 0,
                    duration: 1.1,
                    ease: "power2.out",
                    delay: i * 0.06,
                });

                // Скролл-сдвиг фона
                if (l.yScroll) {
                    gsap.to(node, {
                        y: l.yScroll,
                        ease: "none",
                        scrollTrigger: {
                            trigger: root,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true,
                        },
                    });
                }
            });

            // Лёгкий параллакс текста
            if (contentRef.current && !prefersReduced) {
                gsap.fromTo(
                    contentRef.current,
                    { y: 0, rotateX: 0, rotateY: 0, opacity: 1 },
                    {
                        y: 14,
                        ease: "none",
                        scrollTrigger: {
                            trigger: root,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true,
                        },
                    }
                );
            }

            // Экономия ресурсов: play/pause видео по видимости секции
            if (videoRef.current) {
                ScrollTrigger.create({
                    trigger: root,
                    start: "top bottom",
                    end: "bottom top",
                    onEnter: () => videoRef.current?.play().catch(() => { }),
                    onEnterBack: () => videoRef.current?.play().catch(() => { }),
                    onLeave: () => videoRef.current?.pause(),
                    onLeaveBack: () => videoRef.current?.pause(),
                });
            }
        }, rootRef);

        const refresh = () => ScrollTrigger.refresh();
        window.addEventListener("load", refresh, { once: true });
        (document as any)?.fonts?.ready?.then?.(refresh);

        return () => {
            ctx.revert();
        };
    }, [layers, prefersReduced]);

    // Наклон/параллакс от курсора
    useEffect(() => {
        if (prefersReduced) return;

        const handlePointerMove = (ev: PointerEvent) => {
            const root = rootRef.current;
            if (!root) return;
            const rect = root.getBoundingClientRect();
            const x = (ev.clientX - (rect.left + rect.width / 2)) / rect.width; // -0.5..0.5
            const y = (ev.clientY - (rect.top + rect.height / 2)) / rect.height; // -0.5..0.5

            layerRefs.current.forEach((node, i) => {
                const l = layers[i];
                if (!node || !l) return;
                const tilt = l.tilt ?? 2.0;
                const rx = mapRange(y, -0.5, 0.5, tilt, -tilt);
                const ry = mapRange(x, -0.5, 0.5, -tilt, tilt);
                gsap.to(node, {
                    rotateX: rx,
                    rotateY: ry,
                    duration: 0.6,
                    ease: "power2.out",
                    overwrite: true,
                });
            });

            if (contentRef.current) {
                gsap.to(contentRef.current, {
                    rotateX: y * 3,
                    rotateY: -x * 3,
                    duration: 0.6,
                    ease: "power2.out",
                });
            }
        };

        const resetTilt = () => {
            layerRefs.current.forEach(
                (node) =>
                    node &&
                    gsap.to(node, {
                        rotateX: 0,
                        rotateY: 0,
                        duration: 0.8,
                        ease: "power2.out",
                    })
            );
            if (contentRef.current)
                gsap.to(contentRef.current, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.8,
                    ease: "power2.out",
                });
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerleave", resetTilt);
        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerleave", resetTilt);
        };
    }, [layers, prefersReduced]);


    useEffect(() => {
        const onVis = () => {
            const v = videoRef.current;
            if (!v) return;
            if (document.hidden) v.pause();
            else v.play().catch(() => { });
        };
        document.addEventListener("visibilitychange", onVis);
        return () => document.removeEventListener("visibilitychange", onVis);
    }, []);


    const mask =
        // (  layers[0].maskBottomVH ?? 0) > 0
        true ? `linear-gradient(to bottom, rgba(0,0,0,1) 22%, rgba(0,0,0,1) ${100 - (layers[0].maskBottomVH as number)
            }%, rgba(0,0,0,0) 100%)`
            : undefined;

    return (
        <section
            ref={rootRef}
            className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6 py-24"
            style={{ perspective: "1200px", backgroundColor: "black" }}
            aria-label="Dive into the Universe"
        >

            <div
                ref={sceneRef}
                //  className="pointer-events-none absolute inset-0 -z-10 rounded-3xl border border-white/10"
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                    transformStyle: "preserve-3d",
                    overflow: "hidden",
                    // background:"radial-gradient(circle at 50% -10%, rgba(59,130,246,0.35), transparent 60%)",
                    background: "transparent"
                }}
                aria-hidden
            >
                <div
                    ref={(n) => (layerRefs.current[0] = n)}
                    className="absolute inset-0"
                    style={{
                        transform: `translateZ(${layers[0].z}px)`,
                        willChange: "transform, opacity, filter",
                        WebkitMaskImage: mask,
                        maskImage: mask,
                        opacity: 0,
                    }}
                >
                    <video
                        ref={videoRef}
                        className="h-full w-full object-cover"
                        src={VIDEO_URL}
                        //  для iOS:
                        playsInline
                        muted
                        loop
                        autoPlay
                        preload="metadata"
                        controls={false}
                        disablePictureInPicture
                        onCanPlay={() => {
                            try {
                                void videoRef.current?.play();
                            } catch { }
                        }}
                    />
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{ boxShadow: "0 0 120px 80px rgba(0,0,0,0.85) inset" }}
                    />

                    {/* Доп. плавность: радиальный оверлей (опционально) */}
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background:
                                "radial-gradient(80% 65% at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)",
                        }}
                    />
                </div>

                {/* Цветовая виньетка для связности палитры (без картинок) */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background:
                            "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0) 35%, rgba(0,0,0,0.65))",
                    }}
                />
            </div>

            {/* КОНТЕНТ ПОВЕРХ */}
            <div
                ref={contentRef}
                className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 text-center"
            >
                <p className="text-sm uppercase tracking-[0.6em] text-blue-300/80">
                    NASA NEXT
                </p>
                <h1 className="text-4xl font-semibold tracking-[0.2em] sm:text-5xl md:text-6xl">
                    DIVE INTO THE UNIVERSE
                </h1>
                <p className="text-base text-white/80 sm:text-lg">
                    Journey across galaxies, inspect asteroids in detail, and relive
                    landmark missions through immersive visuals and interactive data.
                </p>
                <Link
                    href="/gallery"
                    className="rounded-full border border-blue-400/60 bg-blue-500/20 px-8 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-blue-200 transition hover:border-blue-300 hover:bg-blue-500/30"
                >
                    Start Exploring
                </Link>
            </div>
        </section>
    );
}
