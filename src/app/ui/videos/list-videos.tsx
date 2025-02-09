import Image from 'next/image';
import Pagination from '../shared/pagination';
import CardVideo from './card-video';
import { fetchFilteredVideos } from '@/app/lib/data/fetchFilteredVideos';


export default async function ListVideos({
    query,
    currentPage,
}: {
    query: string;
    currentPage: number;
}) {

    let { videos, totalPages }: any = await fetchFilteredVideos(query, currentPage) || { videos: [], totalPages: 0 }
    if (query === "") {
        return <></>
    }

    return (
        <>
            {videos && videos.length > 0 ?
                <div className={"mt-35 flex flex-wrap content-around justify-evenly items-stretch px-2"}>
                    {videos.map((video: any, i: number) => {
                        const data = video?.data?.[0]
                        const dataLinks = video?.links
                        return (
                            <CardVideo
                                key={(data?.title + i)}
                                videoPreview={dataLinks?.[0]?.href}
                                videoPlay={video?.videoUrl}
                                title={data?.title}
                                description={data?.description}
                                keywords={data?.keywords}
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
