// Пример использования компонента ImageSlideshow
import { fetchNaturalImages } from "./lib/data/epic/fetchNaturalImages";
import ImageSlideshow from "./ui/main/image-component";
import MainTittle from "./ui/shared/main-tittle";


export default async function Main() {
    const images = await fetchNaturalImages();

    return (

        <main className="bg-black ">

            {images.length > 0 ? (
                <ImageSlideshow images={images} />
            ) : (
                <p>No images available</p>
            )}
        </main>
    );
}