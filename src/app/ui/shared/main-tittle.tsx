export default function MainTittle({ title, description }: { title: string, description: string }) {
    return (
        <div className="text-center text-gray-300 font-semibold pt-16">
            <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl">{title}</h1>
            <p className=" text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl">
                {description}
            </p>
        </div>)
}