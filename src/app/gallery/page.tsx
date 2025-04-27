import { Metadata } from "next";
import ListImages from "../ui/gallery/list-images";
import HelloTitle from "../ui/shared/hello-title";
import SearchData from "../ui/gallery/search-images";
import BackgroundImage from "../ui/shared/background-image";
import { fetchFilteredImages } from "@/app/lib/data/fetchFilteredImages"; // Подключаем сюда!
import Header from "../ui/header/Header";

interface IProps {
  searchParams?: {
    query?: string;
    page?: string;
  };
}

export default async function Page({ searchParams }: IProps) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const { gallery, totalPages } = await fetchFilteredImages(query, currentPage) || { gallery: [], totalPages: 0 };

  return (
    <>
      <Header />
      <BackgroundImage
        src={"https://firebasestorage.googleapis.com/v0/b/nasa-odisey.appspot.com/o/media%2Fbg%2Fgreg-rakozy-oMpAz-DN-9I-unsplash.jpg?alt=media&token=6c2c6d96-9b8e-4db7-a0ac-c7534293e2fd"}
        className="fixed w-full h-full left-0 top-0 z-0 blur-sm"
      />
      <HelloTitle mainText="Hello Earthlings!" supportiveText="Here you can find photos of our planet, other planets, stars and galaxies!" />
      <SearchData />
      <ListImages gallery={gallery} totalPages={totalPages} />
    </>
  );
}
