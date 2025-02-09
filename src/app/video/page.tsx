

import SearchData from "../ui/gallery/search-images";
import HelloTitle from "../ui/shared/hello-title";
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
            <HelloTitle mainText="Hello Earthlings!" supportiveText="Here you can find videos of our planet, other planets, stars and galaxies!" />
            <SearchData />
            <ListVideos query={query} currentPage={currentPage} />
        </main>)
}