import SearchData from "../ui/gallery/search-images";
import Header from "../ui/header/Header";
import BackgroundImage from "../ui/shared/background-image";
import HelloTitle from "../ui/shared/hello-title";
import ListVideos from "../ui/videos/list-videos";
import { fetchFilteredVideos } from "@/app/lib/data/fetchFilteredVideos";
import { fetchWikipediaArticles } from "@/app/lib/wiki";
import WikiSidebar from "../ui/wiki/wiki-sidebar";

interface IProps {
    searchParams?: {
        query?: string;
        page?: string;
    };
}

export default async function PageVideos({ searchParams }: IProps) {
    const query = searchParams?.query || "";
    const currentPage = Number(searchParams?.page) || 1;

    const shouldFetchVideos = query.trim().length > 0;

    const [{ videos, totalPages }, wikiArticles] = await Promise.all([
        shouldFetchVideos
            ? (async () => (await fetchFilteredVideos(query, currentPage)) || { videos: [], totalPages: 0 })()
            : Promise.resolve({ videos: [], totalPages: 0 }),
        fetchWikipediaArticles(query, 8),
    ]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-black to-slate-950 text-white">
            <Header />
            <BackgroundImage
                src={
                    "https://firebasestorage.googleapis.com/v0/b/nasa-odisey.appspot.com/o/media%2Fbg%2Fnasa-Q1p7bh3SHj8-unsplash.jpg?alt=media&token=a07e49aa-8bf6-42dd-a7f3-aaf3043d61ca"
                }
                className="fixed left-0 top-0 z-0 h-full w-full blur-sm"
            />
            <div className="relative z-10">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 pt-24">
                    <HelloTitle
                        mainText="Hello Earthlings!"
                        supportiveText="Here you can find videos of our planet, other planets, stars and galaxies!"
                    />
                    <SearchData />
                </div>
                <main className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
                        <section className="space-y-6">
                            <ListVideos videos={videos} totalPages={totalPages} query={query} />
                        </section>
                        <aside className="space-y-4 self-start lg:sticky lg:top-24">
                            <WikiSidebar articles={wikiArticles} />
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    );
}
