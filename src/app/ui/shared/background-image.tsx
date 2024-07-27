import Image from 'next/image';
import React from 'react';

interface BackgroundImageProps {
    src: string;
    className?: string;
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({ src, className = "" }) => {
    return (
        <div className={`background-photo ${className} -z-10`}>
            <Image
                src={src}
                alt="Background Photo"

                layout="fill"
                objectFit="cover" // покрывает контейнер, сохраняя пропорции
                quality={75} // уменьшает качество для оптимизации
            />
        </div>
    );
};

export default BackgroundImage;
