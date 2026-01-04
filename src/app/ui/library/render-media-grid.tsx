import Image from "next/image";
import { renderMedia } from "./render-media";

export function renderMediaGrid(gallery: { url: string; alt: string }[]) {
    if (!gallery || gallery.length === 0) {
        return renderMedia(undefined);
    }

    return (
        <div className="relative h-60 w-full overflow-hidden rounded-2xl bg-white/5">
            <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-[2px]">
                {gallery.slice(0, 4).map((img, index) => (
                    <div key={index} className="relative overflow-hidden">
                        <Image
                            src={img.url}
                            alt={img.alt}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
    );
}