import Header from "@/app/ui/header/Header";
import { fetchPictureOfTheDay } from "../lib/data/fetchPictureOfTheDay";
import HelloTittle from "../ui/shared/hello-title";
import MainTittle from "../ui/shared/main-tittle";
import BackgroundImage from "../ui/shared/background-image";

export default async function Day() {
  const photoData = await fetchPictureOfTheDay()

  return (

    <>
      <BackgroundImage src={photoData.url} className="fixed w-full h-full left-0 top-0 z-0 blur-sm" />
      <main className="mb-12">

        <div className="">
          <img
            className="rounded-2xl sm:pb-3  object-contain max-h-[85vh] mr-4 float-left"
            src={photoData.url}
            alt={photoData.title}
          />
          <MainTittle title={`Today is ${photoData.title}`} description="" />
          <p className="font-mono text-lg font-bold text-white">
            {photoData.explanation}
          </p>
        </div>

      </main>
    </>)
}