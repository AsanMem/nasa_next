// Пример использования компонента ImageSlideshow
import { fetchNaturalImages } from "./lib/data/epic/fetchNaturalImages";
import ImageSlideshow from "./ui/main/image-component";


export default async function Main() {
    const images = await fetchNaturalImages();

    return (

        <main className="bg-opacity-75 backdrop-blur-sm">
            <h1 className="text-2xl font-bold ">EPIC Natural Color Images</h1>
            {images.length > 0 ? (
                <ImageSlideshow images={images} />
            ) : (
                <p>No images available</p>
            )}
        </main>
    );
}