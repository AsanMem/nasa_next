export default function HelloTittle({ typeContent }: { typeContent: string }) {


  return (
    <div className="text-center text-gray-300 font-semibold pt-16">
      <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl">Hello Earthlings!</h1>
      <p className=" text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl">
        Here you can find {typeContent} of our planet, other planets, stars and galaxies!
      </p>
    </div>)
}