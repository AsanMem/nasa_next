"use client";

import { useState, useEffect } from "react";
import BackgroundImage from "../shared/background-image";
import MainTittle from "../shared/main-tittle";
import useValidImageUrl from "@/app/hooks/useValidImageUrl";


interface PhotoData {
    url?: string;
    hdurl?: string;
    title?: string;
    explanation?: string;
    media_type?: string;
}

interface DayClientProps {
    photoData: PhotoData;
    fallbackImage: string;
}

export default function DayClient({ photoData, fallbackImage }: DayClientProps) {
    const imageUrl = useValidImageUrl(photoData?.url, photoData?.hdurl || fallbackImage);

    return (
        <>
            <BackgroundImage src={imageUrl} className="fixed w-full h-full left-0 top-0 z-0 blur-sm" />
            <main className="mb-12 px-8">
                <div className="">
                    {photoData?.media_type === "image" ? (
                        <img
                            className="rounded-2xl sm:pb-3 object-contain max-h-[85vh] mr-4 float-left"
                            src={imageUrl}
                            alt={photoData?.title}
                        />
                    ) : (
                        <iframe
                            className="rounded-2xl sm:pb-3 object-contain min-h-[30vh] min-w-[35vw] max-h-[85vh] mr-4  float-left shadow-lg"
                            src={photoData?.url}
                            title={photoData?.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{
                                border: '2px solid #ffffff',
                                padding: '10px',
                                backgroundColor: '#000000'
                            }}
                        />
                    )}
                    <MainTittle title={`Today is ${photoData?.title}`} description="" classes="" />
                    <p className=" text-lg font-thin text-gray-100 px-2 text-justify">
                        {photoData?.explanation}
                    </p>
                </div>
            </main>
        </>
    );
}