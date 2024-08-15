
import { Metadata } from "next";
import SearchImages from "../ui/gallery/search-images";
import ListImages from "../ui/gallery/list-images";
import HelloTitle from "../ui/shared/hello-title";

// export const metadata: Metadata = {
//     title: 'Gallery',
// };

interface IProps {
  searchParams?: {
    query?: string;
    page?: string;
  };
}
export default async function Page({ searchParams }: IProps) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;


  return (
    <>
      <HelloTitle mainText="Hello Earthlings!" supportiveText="Here you can find photos of our planet, other planets, stars and galaxies!" />
      <SearchImages />
      <ListImages query={query} currentPage={currentPage} />
    </>

  );
}