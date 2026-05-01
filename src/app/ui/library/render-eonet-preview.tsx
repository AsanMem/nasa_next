import Image from "next/image";

export function renderEonetPreview() {
    const gallery = [
        { url: "/media/eonet/1.jpg", alt: "EONET preview 1" },
        { url: "/media/eonet/2.optimized.webp", alt: "EONET preview 2" },
        { url: "/media/eonet/3.optimized.webp", alt: "EONET preview 3" },
        { url: "/media/eonet/4.optimized.webp", alt: "EONET preview 4" },
    ];

    return (
        <div className="relative h-60 w-full overflow-hidden rounded-2xl bg-white/5">
            <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-[2px]">
                {gallery.map((img) => (
                    <div key={img.url} className="relative overflow-hidden">
                        <Image
                            src={img.url}
                            alt={img.alt}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            className="object-cover"
                            priority={false}
                        />
                    </div>
                ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
    );
}
