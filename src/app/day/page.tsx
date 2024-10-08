
import { fetchPictureOfTheDay } from "../lib/data/fetchPictureOfTheDay";
import HelloTittle from "../ui/shared/hello-title";
import MainTittle from "../ui/shared/main-tittle";
import BackgroundImage from "../ui/shared/background-image";

export default async function Day() {
  const photoData = await fetchPictureOfTheDay()

  return (

    <>
      <BackgroundImage src={photoData.media_type === "image" ? photoData.url :
        `https://firebasestorage.googleapis.com/v0/b/nasa-odisey.appspot.com/o/media%2Flogo%2FNASA_logo.png?alt=media&token=97dc4551-d309-46e9-a660-5b8a58bb179d`

      } className="fixed w-full h-full left-0 top-0 z-0 blur-sm" />
      <main className="mb-12">
        <div className="">
          {photoData.media_type === "image" ? (
            <img
              className="rounded-2xl sm:pb-3 object-contain max-h-[85vh] mr-4 float-left"
              src={photoData.url}
              alt={photoData.title}
            />
          ) : (
            <iframe
              className="rounded-2xl sm:pb-3 object-contain min-h-[30vh] min-w-[35vw] max-h-[85vh] mr-4  float-left shadow-lg"
              src={photoData.url}
              title={photoData.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                border: '2px solid #ffffff',
                padding: '10px',
                backgroundColor: '#000000'
              }}
            />

          )}
          <MainTittle title={`Today is ${photoData.title}`} description="" classes="" />
          <p className=" text-lg font-thin text-gray-100 px-2 text-justify">
            {photoData.explanation}
          </p>
        </div>

      </main>
    </>)
}
