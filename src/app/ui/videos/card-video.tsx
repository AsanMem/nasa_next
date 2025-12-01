"use client";

import { useState } from "react";
import { freezeBodyScroll, unfreezeBodyScroll } from "@/app/lib/utils/scrollUtils";

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

  const openModal = () => {
    freezeBodyScroll();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    unfreezeBodyScroll();
    setShowModal(false);
  };

  return (
    <>
      <div
        onClick={openModal}
        className="cardVideo flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/10 hover:ring-white/20"
      >
        <div className="relative h-56 w-full overflow-hidden bg-black/40">
          {videoPreview ? (
            <img className="h-full w-full object-cover" src={videoPreview} alt={title} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/60">
              Preview unavailable
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
            <svg
              className="h-12 w-12 text-white drop-shadow"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3
            className="text-lg font-semibold text-white"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </h3>
          {description ? (
            <p
              className="text-sm text-white/70"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 pt-14">
          <div
            className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white text-gray-900 shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative bg-black">
              {videoPlay ? (
                <video controls className="h-full w-full">
                  <source src={videoPlay} type="video/mp4" />
                  Your browser does not support MP4 video.
                </video>
              ) : (
                <div className="flex h-64 items-center justify-center text-white">
                  Video unavailable
                </div>
              )}
              <button
                className="absolute right-4 top-4 rounded-full bg-white/80 p-2 text-gray-800 transition hover:bg-white"
                onClick={handleCloseModal}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" stroke="currentColor" fill="none">
                  <path d="M6 6l12 12M6 18L18 6" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="space-y-4 p-6">
              <h3 className="text-xl font-semibold">{title}</h3>
              {description ? (
                <p className="text-sm leading-relaxed text-gray-700">{description}</p>
              ) : null}
              {keywords && keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <span
                      key={`${keyword}-${index}`}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
