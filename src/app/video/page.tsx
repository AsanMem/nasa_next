import HelloTittle from "@/app/ui/hello-tittle";
import ListVideos from "@/app/ui/videos/list-videos";
import SearchVideos from "@/app/ui/videos/search-videos";

interface IProps {
    searchParams?: {
        query?: string;
        page?: string;
    };
}
export default function PageVideos({ searchParams }: IProps) {
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;
    return (
        <main className="">
            <HelloTittle typeContent="videos" />
            <SearchVideos />
            <ListVideos query={query} currentPage={currentPage} />
        </main>)
}