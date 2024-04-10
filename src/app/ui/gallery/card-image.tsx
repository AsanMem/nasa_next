"use client"
import Image from "next/image";
import { useState } from "react";


interface IProps {
    nasaPicture: string, title: string, description: string, keywords: string[] | undefined
}



export default function CardImage({ nasaPicture, title, description, keywords }: IProps) {
    const [showModal, setShowModal] = useState(false);

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) {
            return text;
        }
        return text.slice(0, maxLength) + '...';
    };

    return (
        <>
            <div onClick={toggleModal} className="cursor-pointer w-[270px] max-w-[270px] mt-8 rounded overflow-hidden shadow-lg contener bg-black mx-2">
                <img className="w-full h-[370px] rounded object-cover" src={nasaPicture} alt={title} />
                <div className="p-4 font-light text-base text-neutral-100 flex align-middle">{truncateText(title, 38)}</div>
            </div>
            {showModal && (
                <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4 mx-4  bg-gray-900 bg-opacity-75" >
                    <div className="block rounded-lg bg-white shadow-secondary-1 dark:bg-surface-dark dark:text-white text-surface max-h-[90vh]">
                        <div className="flex">
                            <div className="flex-1">
                                <img className="rounded-tl-lg rounded-bl-lg object-cover w-full h-auto max-h-[90vh]" src={nasaPicture} alt="" />
                            </div>
                            <div className="flex-1 p-6  ">
                                <div className="flex justify-between items-center pr-4 py-2 mb-2">
                                    <h3 className="text-xl font-medium leading-tight">{title}</h3>
                                    <button className="" onClick={handleCloseModal}>х</button>
                                </div>
                                <p className="mb-2 text-base text-slate-700">{description}</p>
                                {keywords && keywords.length > 0 ?
                                    <div className="flex flex-wrap mb-1">
                                        {keywords.map((keyword) => <span className="font-sans mr-2 mb-1 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">{keyword}</span>)}
                                    </div>
                                    : null}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* {showModal && (
                <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4 mx-4 bg-gray-900 bg-opacity-75">
                    <div className="bg-white rounded-lg w-full max-w-screen-sm overflow-hidden">
                        <img className="w-full h-auto rounded-t-lg object-cover" src={nasaPicture} alt="" />
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-medium leading-tight text-gray-900">{title}</h3>
                                <button className="text-gray-600" onClick={handleCloseModal}>x</button>
                            </div>
                            <p className="mb-2 text-base text-gray-700">{description}</p>
                            {keywords && keywords.length > 0 &&
                                <div className="flex flex-wrap mb-1">
                                    {keywords.map((keyword, index) => (
                                        <span key={index} className="mr-2 mb-1 inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">{keyword}</span>
                                    ))}
                                </div>
                            }
                        </div>
                    </div>
                </div>
            )} */}
        </>
    );
}
