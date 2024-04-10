export default function SearchVideos() {


    return (<div className="inpPar flex flex-wrap justify-center">
        <form className="form pt-5 w-full md:w-96 text-center flex items-center justify-center">
            <input
                placeholder="Enter the title"

                className="w-full py-2 pl-4 rounded-l-lg border border-gray-300 focus:outline-none focus:border-slate-900"
            />
            <button
                className="py-2 px-4 bg-slate-900 text-gray-300 rounded-r-lg hover:bg-slate-500 focus:outline-none focus:bg-slate-300 align-middle h-full"

            >
                SEARCH
            </button>
        </form>
    </div>)



}