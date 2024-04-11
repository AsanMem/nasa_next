import Header from "@/app/ui/header/Header";
import HelloTittle from "../ui/hello-tittle";
import SearchVideos from "../ui/videos/search-videos";
import ListVideos from "../ui/videos/list-videos";
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