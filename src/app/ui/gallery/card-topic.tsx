"use client"
import { useState } from "react";
import ModalPortal from "../shared/modal-portal";
import { freezeBodyScroll, unfreezeBodyScroll } from "@/app/lib/utils/scrollUtils";


interface IProps {
    topic: any
}



export default function CardTopic({ topic }: IProps) {
    const [showModal, setShowModal] = useState(false);



    const toggleModal = () => {
        if (!showModal) {
            freezeBodyScroll();
        } else {
            unfreezeBodyScroll();
        }
        setShowModal(!showModal);
    };





    const handleCloseModal = () => {
        setShowModal(false);
    };


    const nasaPicture = topic?.links?.[0]?.href
    const title = topic?.data?.[0]?.title
    const description = topic?.data?.[0]?.description
    const keywords = topic?.data?.[0]?.keywords


    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const nasaId = topic?.data?.[0]?.nasa_id;
            const apiUrl = `https://images-api.nasa.gov/asset/${nasaId}?api_key=${process.env.NEXT_PUBLIC_NASA_API_KEY}`;

            const response = await fetch(apiUrl);
            const data = await response.json();
            console.log(data, "data")
            const imageUrl = data.collection.items.find((item: any) => item?.href?.includes("~orig.jpg"))?.href;

            if (!imageUrl) throw new Error("Original image URL not found");

            const imageResponse = await fetch(imageUrl);
            const blob = await imageResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = title || "nasa_image.jpg";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsDownloading(false);
        }
    };


    return (
        <>
            <div onClick={toggleModal} className="cardTopic mt-8 mx-2 max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <a href="#">
                    <img className="rounded-t-lg w-full h-[370px] rounded object-cover" src={nasaPicture} alt={title} />
                </a>
                <div className="p-5 flex flex-col justify-between">
                    <div className="flex items-start justify-between mb-2">
                        <h5 className="w-[90%] text-xl font-bold tracking-tight line-clamp-2 text-gray-900 dark:text-white">
                            {title}
                        </h5>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDownload();
                            }}
                            className="w-[10%]  flex justify-center items-center rounded-lg hover:bg-blue-500 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            disabled={isDownloading}
                        >
                            {isDownloading ? (
                                <svg
                                    className="animate-spin h-14 w-14 text-black"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            ) : (
                                <svg
                                    className="h-14 w-14 text-black"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    ></path>
                                </svg>
                            )}
                        </button>
                    </div>
                    <div className=" flex-col justify-between">

                        <p className="mb-2 font-normal text-sm text-gray-700 dark:text-gray-400 max-h-[100px] break-words line-clamp-4 " >{description}</p>

                    </div>

                </div>


                {showModal && (
                    <ModalPortal>
                        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4 pt-14 bg-gray-900 bg-opacity-75 " >
                            <div className="block rounded-lg bg-white shadow-secondary-1 dark:bg-surface-dark dark:text-white text-surface max-w-full sm:max-w-[95vw]  max-h-full" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
                                <div className="flex flex-col sm:flex-row h-full">
                                    <div className="flex-1">
                                        <img className="flex-1 float-right rounded-tl-lg rounded-bl-lg object-cover w-full max-w-full sm:max-w-[95vw] max-h-[95vh]" src={nasaPicture} alt="" />
                                    </div>
                                    <div className="flex-1 p-6 overflow-y-auto" style={{ overflowX: 'hidden' }}>
                                        <div className="flex justify-between items-center pr-4 py-2 mb-2">
                                            <h3 className="text-xl font-medium leading-tight">{title}</h3>
                                            <button className="" onClick={handleCloseModal}>x</button>
                                        </div>
                                        <p className="mb-2 text-base text-slate-700" style={{ wordWrap: 'break-word' }}>{description}</p>
                                        {keywords && keywords.length > 0 ?
                                            <div className="flex flex-wrap mb-1">
                                                {keywords.map((keyword: string, index: number) => <span key={index} className="font-sans mr-2 mb-1 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">{keyword}</span>)}
                                            </div>
                                            : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ModalPortal>
                )}
            </div>
        </>);
}