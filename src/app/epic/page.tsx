import { pageMetadata } from "@/app/lib/site";
import s from "../ui/orbital/chapters.module.css";
import { fetchEpicImages } from "../lib/nasa/epic";
import ImageSlideshow from "../ui/main/image-component";
import { Chapter, ChapterHeading, EmptyState } from "../ui/orbital/chapter";
export const revalidate = 43200;
export const metadata=pageMetadata("/epic","Earth from deep space: EPIC observations | Orbital","Watch real natural-color Earth observations from NASA’s EPIC camera aboard DSCOVR, frame by frame.");
export default async function EpicPage() {
  const images = await fetchEpicImages(100);
  return <Chapter className={s.epicChapter}><ChapterHeading compact title="Watch Earth turn" description="A day of Earth photographs from NASA’s EPIC camera, one frame at a time." />
    {images?.length ? <ImageSlideshow images={images} /> : <EmptyState title="Earth observations are unavailable"><p>NASA did not return any EPIC images. Check again later for the next available sequence.</p></EmptyState>}
  </Chapter>;
}
