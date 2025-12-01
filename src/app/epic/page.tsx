import Link from "next/link";

import { ROUTES } from "../lib/constants/routes";
import { fetchNaturalImages } from "../lib/data/epic/fetchNaturalImages";
import ImageSlideshow from "../ui/main/image-component";

export default async function Main() {
    const images = await fetchNaturalImages();
    //  console.log(images, "images")
    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-black to-slate-950 text-white">
            <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16">
                <header className="flex flex-col gap-4">
                    <p className="text-sm uppercase tracking-[0.6em] text-white/50">EONET</p>
                    <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                        EPIC Natural Color Images In Real Time
                    </h1>
                    <p className="max-w-3xl text-base text-white/70 sm:text-lg">
                        This feed highlights live geophysical phenomena captured by NASA and agency partners.
                        Data is fetched server-side and revalidated every 30 minutes to keep the view current.
                    </p>
                    <Link
                        href={ROUTES.library}
                        className="inline-flex items-center justify-center self-start rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/20"
                    >
                        Back to Library
                    </Link>
                </header>


                {images && images.length > 0 ? (
                    <ImageSlideshow images={images} />
                ) : (
                    <p>No images available</p>
                )}

            </div></div>
    );
}