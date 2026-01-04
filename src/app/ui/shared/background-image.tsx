import Image from "next/image";
import React from "react";

interface BackgroundImageProps {
    src: string;
    className?: string;
}

const FALLBACK =
    "https://firebasestorage.googleapis.com/v0/b/nasa-odisey.appspot.com/o/media%2Fbg%2Fearth_back.jpg?alt=media&token=be33b27e-78ef-492e-8c2a-b0cd504c8fa6";

const BackgroundImage: React.FC<BackgroundImageProps> = ({ src, className = "" }) => {
    return (
        <div className={`pointer-events-none ${className}`} aria-hidden="true">
            <Image
                src={src || FALLBACK}
                alt=""
                fill
                priority
                unoptimized
                sizes="100vw"
                className="object-cover"
            />
        </div>
    );
};

export default BackgroundImage;
