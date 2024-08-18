export default function MainTittle({ title, description, classes }: { title: string, description: string, classes: string }) {
    return (
        <div className={`text-center text-gray-300 font-semibold py-4 ${classes}`}>
            <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl">{title}</h1>
            <p className=" text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl">
                {description}
            </p>
        </div>)
}