import { fetchImageOfTheDay } from "../lib/data/day/fetchImageOfTheDay";
import MainTittle from "../ui/main-tittle";


export default async function Day() {

  let photoData = await fetchImageOfTheDay();
  console.log(photoData, "photoData")
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