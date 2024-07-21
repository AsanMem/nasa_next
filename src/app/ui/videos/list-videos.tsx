import Image from 'next/image';
import Pagination from '../gallery/pagination';

import CardVideo from './card-video';
import { fetchFilteredVideos } from '@/app/lib/data/videos/fetchFilteredVideos';





export default async function ListVideos({
    query,
    currentPage,
}: {
    query: string;
    currentPage: number;
}) {

    let { videos, totalPages } = await fetchFilteredVideos(query, currentPage)

    if (query === "") {
        return <></>
    }

    return (
        <>
            {videos && videos.length > 0 ?
                <div className={"mt-35 flex flex-wrap content-around justify-evenly items-stretch px-2"}>
                    {videos.map((videoElem, i) => {
                        // console.log(videoElem.data[0]?.keywords, "videoElem")
                        return (
                            <CardVideo
                                key={(videoElem.data[0].title + i)}
                                videoPreview={videoElem.links[0].href}
                                videoPlay={videoElem?.links[1]?.href}
                                title={videoElem.data[0].title}
                                description={videoElem.data[0].description}
                                keywords={videoElem.data[0]?.keywords}
                            />


                        )
                    })}
                    <div className="mt-5 flex w-full justify-center">
                        <Pagination totalPages={totalPages} />
                    </div>
                </div>

                : <div className={"mt-35 flex flex-wrap content-around justify-evenly items-stretch"}><div className="text-2xl text-slate-300 flex items-center justify-between  pb-4 my-8"> 'This is not found :('</div></div>
            }
        </>)
}
