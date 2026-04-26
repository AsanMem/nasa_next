import { formatMetadataDate } from "@/app/lib/utils/formatMetadataDate";
import { BUTTON_CLASS, PREVIEW_SECTIONS, PreviewContent, SECTION_CARD_CLASS } from "./constants";

import { renderEonetPreview } from "./render-eonet-preview";
import { renderMedia } from "./render-media";
import { renderMediaGrid } from "./render-media-grid";
import Link from "next/link";
import EpicSlideshow from "./epic-slide-show";
import { renderAsteroidPreview } from "./render-asteroid-preview";

export function PreviewCard({
    section,
    content,
    query
}: {
    section: (typeof PREVIEW_SECTIONS)[number];
    content: PreviewContent | null;
    query?: string;
}) {
    const isGallerySection =
        section.key === "images" || section.key === "videos";
    const isEpicSection = section.key === "epic";
    const isAsteroid = section.key === "neos";

    const isEonetSection = section.key === "eonet";
    const href =
        query && isGallerySection
            ? `${section.href}?page=1&query=${encodeURIComponent(query)}`
            : section.href;

    let mediaNode: React.ReactNode;

    if (isEpicSection && content?.slideshow?.length) {
        mediaNode = <EpicSlideshow slides={content.slideshow} />;
    } else if (isEonetSection) {
        mediaNode = renderEonetPreview()
    } else if (isGallerySection && content?.gallery?.length) {
        mediaNode = renderMediaGrid(content.gallery);
    } else if (isAsteroid) {
        mediaNode = renderAsteroidPreview()
    }

    else {
        mediaNode = renderMedia(content?.media);
    }

    return (
        <div className={SECTION_CARD_CLASS}>
            {mediaNode}

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/50">
                    <span>{section.title}</span>
                    <span>Featured</span>
                </div>

                <h3 className="break-words [overflow-wrap:anywhere] text-xl font-semibold tracking-tight">
                    {content?.title ?? section.title}
                </h3>

                <p className="text-readable break-words [overflow-wrap:anywhere] text-sm text-white/70">
                    {content?.description ?? section.description}
                </p>

                <p className="text-xs uppercase tracking-[0.4em] text-white/40">
                    {formatMetadataDate(content?.metadata)}
                </p>
            </div>

            <div className="flex-1" />
            <Link href={href} className={BUTTON_CLASS}>
                Open
            </Link>
        </div>
    );
}
