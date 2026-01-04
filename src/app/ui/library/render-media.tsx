import Image from "next/image";
import { PreviewContent } from "./constants";

export function renderMedia(media?: PreviewContent["media"]) {
    if (!media) {
        return (
            <div className="flex h-40 items-center justify-center rounded-2xl bg-white/5 text-sm text-white/40">
                Preview unavailable
            </div>
        );
    }

    return (
        <div className="relative h-60 w-full overflow-hidden rounded-2xl bg-white/5">
            <Image
                src={media.url}
                alt={media.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover"
                unoptimized
                priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
    );
}
