export default function HelloTitle({ mainText, supportiveText }: { mainText: string | JSX.Element, supportiveText: string }) {


  return (
    <div className="text-center text-gray-300 font-semibold pt-16">
      <h1 className="text-2xl sm:text-2xl md:text-4xl lg:text-4xl xl:text-5xl px-8">{mainText}</h1>
      <p className=" text-xs sm:text-xs md:text-xl lg:text-2xl xl:text-3xl px-16"> {supportiveText}
      </p>
    </div>)
}