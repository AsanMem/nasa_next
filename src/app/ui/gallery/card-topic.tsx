"use client"
import Image from "next/image";
import { useState } from "react";


interface IProps {
    topic: any
}



export default function CardTopic({ topic }: IProps) {
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
        return text.slice(0, maxLength) + '...';
    };

    console.log(topic, "topic")

    const nasaPicture = topic.links[0].href
    const title = topic.data[0].title
    const description = topic.data[0].description
    const keywords = topic.data[0]?.keywords





    return (
        <>


            <div onClick={toggleModal} className=" mt-8  max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <a href="#">
                    <img className="rounded-t-lg w-full h-[370px] rounded object-cover" src={nasaPicture} alt={title} />
                </a>
                <div className="p-5 flex-col justify-between">
                    <a href="#">
                        <h5 className="mb-2 text-xl font-bold tracking-tight line-clamp-2 text-gray-900 dark:text-white">{title}</h5>
                    </a>
                    <p className="mb-2 font-normal text-sm text-gray-700 dark:text-gray-400 max-h-[100px] break-words line-clamp-4 " >{description}</p>
                    <a href="#" className="inline-flex items-center align-bottom px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        Read more
                        <svg className="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
                        </svg>
                    </a>
                </div>

            </div>




            {/* <div onClick={toggleModal} className="cursor-pointer w-[270px] max-w-[270px] mt-8 rounded overflow-hidden shadow-lg contener bg-black mx-2">
                <img className="w-full h-[370px] rounded object-cover" src={nasaPicture} alt={title} />
                <div className="p-4 font-light text-base text-neutral-100 flex align-middle">{truncateText(title, 38)}</div>
            </div> */}
            {showModal && (
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
                                        {keywords.map((keyword, index) => <span key={index} className="font-sans mr-2 mb-1 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">{keyword}</span>)}
                                    </div>
                                    : null}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}