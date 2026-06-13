import Link from "next/link";

import { ROUTES } from "../lib/constants/routes";
import ImageSlideshow from "../ui/main/image-component";
import { fetchEpicImages } from "../lib/nasa/epic";

export const revalidate = 43200;

export default async function Main() {
    const images = await fetchEpicImages(10);
    return (
        <div className="min-h-screen bg-black text-white">
            <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16">
                <header className="flex flex-col gap-4">
                    <p className="text-sm uppercase tracking-[0.6em] text-white/50">   EPIC EARTH</p>
                    <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                        Earth, as Seen From Deep Space
                    </h1>
                    <p className="text-readable max-w-3xl text-base text-white/70 sm:text-lg">
                        Experience real-time natural-color images of Earth captured by NASA’s EPIC camera
                        aboard the DSCOVR spacecraft. A living portrait of our planet, refreshed throughout the day.
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
