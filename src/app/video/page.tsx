import Header from "@/app/ui/header/Header";
import HelloTittle from "../ui/hello-tittle";
import SearchVideos from "../ui/videos/search-videos";

export default function Video() {

    return (
        <main className="">
            <HelloTittle typeContent="videos" />
            <SearchVideos />
        </main>)
}