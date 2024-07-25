import Header from "@/app/ui/header/Header";
import { fetchPictureOfTheDay } from "../lib/data/fetchPictureOfTheDay";
import HelloTittle from "../ui/shared/hello-title";
import MainTittle from "../ui/shared/main-tittle";

export default async function Day() {
  const photoData = await fetchPictureOfTheDay()

  return (
    <main className="">
      <>

        <MainTittle title={`Today is ${photoData.title}`} description="" />


        <div className="my-6">
          <img
            className="rounded-2xl object-contain max-h-[80vh] mr-4 float-left"
            src={photoData.url}
            alt={photoData.title}
          />
          <p className="font-mono text-lg font-bold text-white">
            {photoData.explanation}
          </p>
        </div>
      </>

    </main>)
}