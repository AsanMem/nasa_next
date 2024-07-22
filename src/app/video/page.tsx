
import ListVideos from "@/app/ui/videos/list-videos";
import SearchVideos from "@/app/ui/videos/search-videos";
import HelloTitle from "../ui/shared/hello-title";

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
            <HelloTitle mainText="Hello Earthlings!" supportiveText="Here you can find videos of our planet, other planets, stars and galaxies!" />
            <SearchVideos />
            <ListVideos query={query} currentPage={currentPage} />
        </main>)
}