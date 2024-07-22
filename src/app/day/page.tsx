import Header from "@/app/ui/header/Header";
import { fetchPictureOfTheDay } from "../lib/data/fetchPictureOfTheDay";
import HelloTittle from "../ui/shared/hello-title";

export default async function Day() {
  const photoData = await fetchPictureOfTheDay()

  return (
    <main className=" pb-24">
      <>
        <HelloTittle mainText={photoData.title} supportiveText={`Today is ${photoData.date}, which means meet this beautiful snapshot of
            the day`} />
        <div className=" my-8 ">
          <img
            className="max-w-[75vw] h-auto mr-4 mb-1 rounded-sm object-contain max-h-[80vh] float-left shape-outside shape-square"
            src={photoData.url}
            alt={photoData.title}
          />
          <div className="text-gray-300 text-base md:text-xl lg:text-xl xl:text-2xl">
            {photoData.explanation}
          </div>
        </div>
      </>
    </main>)
}