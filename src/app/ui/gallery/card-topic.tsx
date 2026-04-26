"use client";

import { useState } from "react";
import ModalPortal from "../shared/modal-portal";
import { freezeBodyScroll, unfreezeBodyScroll } from "@/app/lib/utils/scrollUtils";

interface IProps {
  topic: any;
}

export default function CardTopic({ topic }: IProps) {
  const [showModal, setShowModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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
    unfreezeBodyScroll();
  };

  const nasaPicture = topic?.links?.[0]?.href;
  const title = topic?.data?.[0]?.title ?? "NASA asset";
  const description = topic?.data?.[0]?.description;
  const keywords = topic?.data?.[0]?.keywords;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const nasaId = topic?.data?.[0]?.nasa_id;
      if (!nasaId) {
        throw new Error("NASA ID is missing");
      }
      const apiUrl = `https://images-api.nasa.gov/asset/${nasaId}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Unable to download asset");
      }
      const data = await response.json();
      const imageUrl = data.collection.items.find((item: any) =>
        item?.href?.includes("~orig.jpg"),
      )?.href;

      if (!imageUrl) {
        throw new Error("Original image URL not found");
      }

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
      <div
        onClick={toggleModal}
        className="cardTopic flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/10 hover:ring-white/20"
      >
        <div className="relative h-60 w-full overflow-hidden bg-black/30">
          {nasaPicture ? (
            <img className="h-full w-full object-cover" src={nasaPicture} alt={title} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/50">
              Preview unavailable
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="flex flex-1 flex-col gap-4 p-5">
          <div className="flex items-start gap-3">
            <h5
              className="flex-1 text-lg font-semibold text-white"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {title}
            </h5>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isDownloading) {
                  void handleDownload();
                }
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <svg
                  className="h-5 w-5 animate-spin text-white"
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
                  className="h-5 w-5"
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
          {description ? (
            <p
              className="text-readable text-sm text-white/70"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 4,
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
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 pt-14">
            <div
              className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white text-gray-900 shadow-2xl"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="flex-1 bg-black/80">
                  {nasaPicture ? (
                    <img className="h-full w-full object-cover" src={nasaPicture} alt={title} />
                  ) : null}
                </div>
                <div className="flex-1 space-y-4 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                    <button
                      className="rounded-full bg-gray-100 p-2 text-gray-700 transition hover:bg-gray-200"
                      onClick={handleCloseModal}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" stroke="currentColor" fill="none">
                        <path d="M6 6l12 12M6 18L18 6" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  {description ? (
                    <p className="text-readable text-sm text-gray-700">{description}</p>
                  ) : null}
                  {keywords && keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((keyword: string, index: number) => (
                        <span
                          key={index}
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
          </div>
        </ModalPortal>
      )}
    </>
  );
}
