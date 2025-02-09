
import { Metadata } from "next";
import ListImages from "../ui/gallery/list-images";
import HelloTitle from "../ui/shared/hello-title";
import SearchData from "../ui/gallery/search-images";

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
      <SearchData />
      <ListImages query={query} currentPage={currentPage} />
    </>

  );
}