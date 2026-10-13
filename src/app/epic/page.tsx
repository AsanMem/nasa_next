import { fetchEpicImages } from "../lib/nasa/epic";
import ImageSlideshow from "../ui/main/image-component";
import { Chapter, ChapterHeading, EmptyState } from "../ui/orbital/chapter";
export const revalidate = 43200;
export const metadata = { title: "Earth from deep space · Orbital", description: "Explore NASA EPIC natural-color Earth observations from DSCOVR." };
export default async function EpicPage() {
  const images = await fetchEpicImages(10);
  return <Chapter><ChapterHeading label="EPIC / DSCOVR" title="A whole world in view." description="Natural-color observations from NASA's EPIC camera, looking back at Earth from deep space. Move through the available frames to see our planet turn." />
    {images?.length ? <ImageSlideshow images={images} /> : <EmptyState title="Earth observations are unavailable"><p>NASA did not return any EPIC images. Check again later for the next available sequence.</p></EmptyState>}
  </Chapter>;
}
