"use client";
import Image from "next/image";
import { useState } from "react";

interface IProps {
    videoPreview: string;
    videoPlay: string;
    title: string;
    description: string;
    keywords: string[] | undefined;
}

export default function CardVideo({
    videoPreview,
    videoPlay,
    title,
    description,
    keywords,
}: IProps) {
    const [showModal, setShowModal] = useState(false);

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };


    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) {
            return text;
        }
        return text.slice(0, maxLength) + "...";
    };

    return (
        <>
            <div
                onClick={toggleModal}
                className="cursor-pointer w-[300px] max-w-[300px] mt-12 rounded overflow-hidden shadow-lg contener bg-black"
            >
                <img
                    className="w-full h-[180px] rounded object-cover"
                    src={videoPreview}
                    alt={title}
                />
                <div className="p-4 font-light text-base text-neutral-100 flex align-middle h-max ">
                    {truncateText(title, 38)}
                </div>
            </div>
            {showModal && (
                <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4 pt-14 bg-gray-900 bg-opacity-75">
                    <div
                        className="block rounded-lg bg-white shadow-secondary-1 dark:bg-surface-dark dark:text-white text-surface max-w-full sm:max-w-[95vw]  max-h-full"
                        style={{ maxHeight: "100vh", overflowY: "auto" }}
                    >
                        <div className="flex flex-col sm:flex-row h-full">
                            <div className="flex-1">
                                <video
                                    controls
                                    width="100%"
                                    height="auto"
                                    autoPlay
                                >
                                    <source
                                        src={videoPlay}
                                        type="video/mp4"
                                    />
                                    Your browser does not support MP4 video.
                                </video>
                            </div>
                            <div
                                className="flex-1 p-6 overflow-y-auto"
                                style={{ overflowX: "hidden" }}
                            >
                                <div className="flex justify-between items-center pr-4 py-2 mb-2">
                                    <h3 className="text-xl font-medium leading-tight">
                                        {title}
                                    </h3>
                                    <button
                                        className=""
                                        onClick={handleCloseModal}
                                    >
                                        x
                                    </button>
                                </div>
                                <p
                                    className="mb-2 text-base text-slate-700"
                                    style={{ wordWrap: "break-word" }}
                                >
                                    {description}
                                </p>
                                {keywords && keywords.length > 0 ? (
                                    <div className="flex flex-wrap mb-1">
                                        {keywords.map((keyword, index) => (
                                            <span
                                                key={index}
                                                className="font-sans mr-2 mb-1 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
