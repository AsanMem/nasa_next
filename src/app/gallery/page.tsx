import ListImages from "../ui/gallery/list-images";
import HelloTitle from "../ui/shared/hello-title";
import SearchData from "../ui/gallery/search-images";
import { fetchFilteredImages } from "@/app/lib/data/fetchFilteredImages";
import Header from "../ui/header/Header";
import { fetchWikipediaArticles } from "@/app/lib/wiki";
import WikiSidebar from "../ui/wiki/wiki-sidebar";

interface IProps {
  searchParams?: {
    query?: string;
    page?: string;
  };
}

export default async function Page({ searchParams }: IProps) {
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;

  const [{ gallery, totalPages }, wikiArticles] = await Promise.all([
    (async () => (await fetchFilteredImages(query, currentPage)) || { gallery: [], totalPages: 0 })(),
    fetchWikipediaArticles(query, 8),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-slate-950 text-white">
      <Header />
      <div className="relative z-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 pt-16">
          <HelloTitle
            mainText="Hello Earthlings!"
            supportiveText="Here you can find photos of our planet, other planets, stars and galaxies!"
          />
          <SearchData />
        </div>
        <main className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
            <section className="space-y-6">
              <ListImages gallery={gallery} totalPages={totalPages} />
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
