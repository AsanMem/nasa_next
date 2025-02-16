import Image from 'next/image';
import React from 'react';

interface BackgroundImageProps {
    src: string;
    className?: string;
}
const BackgroundImage: React.FC<BackgroundImageProps> = ({ src, className = "" }) => {
    return (
        <div className={`background-photo ${className} -z-10`} style={{ zIndex: -10 }}>

            <Image
                src={src || `https://firebasestorage.googleapis.com/v0/b/nasa-odisey.appspot.com/o/media%2Fbg%2Fearth_back.jpg?alt=media&token=be33b27e-78ef-492e-8c2a-b0cd504c8fa6`
                }
                alt="Background Photo"
                layout="fill"
                objectFit="cover" // покрывает контейнер, сохраняя пропорции
                quality={75} // уменьшает качество для оптимизации

            />
        </div>
    );
};

export default BackgroundImage;
