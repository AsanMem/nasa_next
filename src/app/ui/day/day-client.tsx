"use client";

import Link from "next/link";
import MainTittle from "../shared/main-tittle";
import { useValidImageUrl } from "@/app/hooks/useValidImageUrl";
import { ROUTES } from "@/app/lib/constants/routes";
import Header from "../header/Header";
import { useMemo, useState } from "react";
import { sanitizePlainText } from "@/app/lib/utils/text";

interface PhotoData {
    url?: string;
    hdurl?: string;
    title?: string;
    explanation?: string;
    media_type?: string;
}

interface DayClientProps {
    photoData: PhotoData | null;
}

function toYouTubeEmbedUrl(url?: string) {
    if (!url) return undefined;
    try {
        const u = new URL(url);
        if (u.hostname.includes("youtu.be")) {
            const id = u.pathname.replace("/", "");
            return id ? `https://www.youtube.com/embed/${id}` : url;
        }
        if (u.hostname.includes("youtube.com")) {
            const id = u.searchParams.get("v");
            if (id) return `https://www.youtube.com/embed/${id}`;
            return url;
        }
        return url;
    } catch {
        return url;
    }
}

function isExternalMediaUrl(url?: string) {
    return /^https?:\/\//i.test(url ?? "");
}

export default function DayClient({ photoData }: DayClientProps) {
    const defaultImageUrl = "/media/starfield/2.png";
    const hasData = Boolean(photoData);
    const validApodUrl = useValidImageUrl(photoData?.url, photoData?.hdurl);

    const isImage = photoData?.media_type === "image";
    const isVideo = photoData?.media_type === "video";

    const imageUrl = isImage && validApodUrl ? validApodUrl : defaultImageUrl;
    const videoUrl = isVideo ? toYouTubeEmbedUrl(photoData?.url) : undefined;
    const [backgroundFailed, setBackgroundFailed] = useState(false);

    const backgroundUrl = useMemo(() => {
        if (backgroundFailed) return defaultImageUrl;
        if (isImage && photoData?.url) return photoData.url;
        return defaultImageUrl;
    }, [backgroundFailed, isImage, photoData?.url]);

    const explanation = sanitizePlainText(photoData?.explanation);
    const title = sanitizePlainText(photoData?.title);

    const [imgReady, setImgReady] = useState(false);
    const [imgRatio, setImgRatio] = useState<number | null>(null);

    const originalImageUrl = isImage ? photoData?.hdurl ?? photoData?.url : undefined;
    const sourceMediaUrl = isVideo ? photoData?.url : originalImageUrl;
    const externalSourceMediaUrl = isExternalMediaUrl(sourceMediaUrl) ? sourceMediaUrl : undefined;

    const containerAspect = useMemo(() => {
        if (!imgRatio) return 16 / 9;
        return Math.max(0.5, Math.min(imgRatio, 2.0));
    }, [imgRatio]);

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-black via-black to-slate-950 text-white">
            <Header />

            <img
                aria-hidden="true"
                alt=""
                src={backgroundUrl}
                className="pointer-events-none fixed inset-0 z-0 h-full w-full scale-110 object-cover blur-2xl opacity-50"
                onError={() => setBackgroundFailed(true)}
            />

            <div className="pointer-events-none fixed inset-0 z-10 bg-[radial-gradient(80%_60%_at_50%_30%,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.62)_60%,rgba(0,0,0,0.9)_100%)]" />

            <div className="relative z-20 mx-auto flex max-w-7xl flex-col gap-6 px-6 py-16">
                <header className="flex flex-col gap-4">
                    <p className="text-sm uppercase tracking-[0.6em] text-white/50">MEDIA OF THE DAY</p>

                    <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                        {hasData
                            ? (title ? `NASA highlight: ${title}` : "NASA media highlight")
                            : "NASA highlight is updating"}
                    </h1>

                    <p className="text-readable max-w-3xl text-base leading-relaxed text-white/70 sm:text-lg">
                        {hasData
                            ? "Daily highlights from the cosmos with NASA’s featured media."
                            : "The daily feed is temporarily unavailable. Please check back soon — meanwhile you can explore the Library."}
                    </p>

                    <Link
                        href={ROUTES.library}
                        className="inline-flex items-center justify-center self-start rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/20"
                    >
                        Back to Library
                    </Link>
                </header>

                <section className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-lg">
                    <div
                        className={`
    mb-6 w-full overflow-hidden rounded-2xl
    bg-black/30 ring-1 ring-white/10
    shadow-[0_10px_30px_rgba(0,0,0,0.35)]
    transition-all

    ${isImage
                                ? "lg:float-none lg:mx-auto lg:w-[min(90vw,1100px)]"
                                : "lg:float-left lg:mr-8 lg:mb-4 lg:w-[540px]"
                            }
  `}
                        style={{
                            aspectRatio: String(containerAspect),
                            maxHeight: isImage ? "85vh" : "70vh",
                            minHeight: isImage ? undefined : "240px",
                        }}
                    >

                        {isImage && (
                            <div className="relative h-full w-full">
                                {externalSourceMediaUrl ? (
                                    <a
                                        href={externalSourceMediaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={photoData?.hdurl ? "View HD APOD image" : "Open APOD image source"}
                                        className="absolute right-3 top-3 z-10 inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white backdrop-blur transition hover:bg-white/20"
                                    >
                                        {photoData?.hdurl ? "View HD" : "Open source"}
                                    </a>
                                ) : null}

                                {!imgReady && (
                                    <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60" />
                                )}

                                <img
                                    aria-hidden="true"
                                    src={imageUrl}
                                    alt=""
                                    className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-xl"
                                />

                                <img
                                    src={imageUrl}
                                    alt={title ?? "APOD image"}
                                    className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${imgReady ? "opacity-100" : "opacity-0"
                                        }`}
                                    onLoad={(e) => {
                                        const el = e.currentTarget;
                                        const w = (el as HTMLImageElement).naturalWidth || 0;
                                        const h = (el as HTMLImageElement).naturalHeight || 0;
                                        if (w && h) setImgRatio(w / h);
                                        setImgReady(true);
                                    }}
                                    onError={() => setImgReady(true)}
                                />
                            </div>
                        )}

                        {isVideo && (
                            <div className="relative h-full w-full">
                                {externalSourceMediaUrl ? (
                                    <a
                                        href={externalSourceMediaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute right-3 top-3 z-10 inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white backdrop-blur transition hover:bg-white/20"
                                    >
                                        Open source
                                    </a>
                                ) : null}
                                <div className="relative aspect-video h-full w-full">
                                    <iframe
                                        className="absolute inset-0 h-full w-full"
                                        src={videoUrl}
                                        title={title ?? "APOD video"}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        )}

                        {!hasData && (
                            <div className="grid h-full place-items-center px-6 text-center">
                                <div className="max-w-md">
                                    <p className="text-xs uppercase tracking-[0.4em] text-white/40">Media of the day</p>
                                    <h3 className="mt-2 text-lg font-semibold text-white">
                                        NASA highlight is updating
                                    </h3>
                                    <p className="text-readable mt-2 text-sm text-white/70">
                                        NASA’s daily feed is temporarily unavailable. Please check back soon.
                                    </p>

                                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                                        <Link
                                            href={ROUTES.library}
                                            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/20"
                                        >
                                            Explore the Library
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => window.location.reload()}
                                            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:border-white/40 hover:bg-white/10"
                                        >
                                            Refresh
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <MainTittle title="" description="" classes="" />
                    <p className="text-readable text-justify text-sm leading-relaxed text-gray-100">{explanation}</p>

                    <div className="clear-both hidden lg:block" />
                </section>
            </div>
        </div>
    );
}
