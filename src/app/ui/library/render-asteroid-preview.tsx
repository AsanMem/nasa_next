import Image from "next/image";

export function renderAsteroidPreview() {
    const img = {
        url: "/media/main/Asteroid Psyche (Illustration).jpg",
        alt: "Asteroid Psyche (Illustration)",
    };

    return (
        <div className="relative h-60 w-full overflow-hidden rounded-2xl bg-white/5">
            <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="100vw"
                className="object-cover"
                priority={false}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
    );
}
