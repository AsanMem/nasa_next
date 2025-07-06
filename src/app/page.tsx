// 'use server'

import Menu from "./menu";
import ParallaxLayer from "./ui/parallax/parallax-layer";
import Welcome from "./welcome";

export default async function Main() {

    return (
        <main className="">
            {/* <ParallaxLayer /> */}

            {/* <section className="relative h-screen flex items-center justify-center">
                <TransitionImage src="/media/nebula.png" /> 
            </section> */}
            <Welcome />


        </main>

    );
}




// import { fetchNaturalImages } from "./lib/data/epic/fetchNaturalImages";
// import ImageSlideshow from "./ui/main/image-component";

// const images = await fetchNaturalImages();
//  console.log(images, "images")

//     {images && images.length > 0 ? (
//         <ImageSlideshow images={images} />
//     ) : (
//         <p>No images available</p>
//     )}