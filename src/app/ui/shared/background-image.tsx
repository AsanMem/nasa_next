import Image from "next/image";
import React from "react";

interface BackgroundImageProps {
    src: string;
    className?: string;
}

const FALLBACK = "/media/main/1.jpg";

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
