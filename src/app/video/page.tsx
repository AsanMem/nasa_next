

import SearchData from "../ui/gallery/search-images";
import Header from "../ui/header/Header";
import BackgroundImage from "../ui/shared/background-image";
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
            <Header />
            <BackgroundImage src={"https://firebasestorage.googleapis.com/v0/b/nasa-odisey.appspot.com/o/media%2Fbg%2Fnasa-Q1p7bh3SHj8-unsplash.jpg?alt=media&token=a07e49aa-8bf6-42dd-a7f3-aaf3043d61ca"} className="fixed w-full h-full left-0 top-0 z-0 blur-sm" />
            <HelloTitle mainText="Hello Earthlings!" supportiveText="Here you can find videos of our planet, other planets, stars and galaxies!" />
            <SearchData />
            <ListVideos query={query} currentPage={currentPage} />
        </main>)
}