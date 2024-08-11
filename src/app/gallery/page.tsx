// import Pagination from '@/app/ui/invoices/pagination';
// import Search from '@/app/ui/search';
// import Table from '@/app/ui/invoices/table';
// import { CreateInvoice } from '@/app/ui/invoices/buttons';
// import { lusitana } from '@/app/ui/fonts';
// import { InvoicesTableSkeleton } from '@/app/ui/skeletons';
// import { Suspense } from 'react';
// import { fetchInvoicesPages } from '@/app/lib/data';
import { Metadata } from "next";
import SearchImages from "../ui/gallery/search-images";
import ListImages from "../ui/gallery/list-images";
import HelloTitle from "../ui/shared/hello-title";

// export const metadata: Metadata = {
//     title: 'Invoices',
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

  // const totalPages = await fetchInvoicesPages(query);
  // console.log({query,currentPage,totalPages})
  return (
    <>
      <HelloTitle mainText="Hello Earthlings!" supportiveText="Here you can find photos of our planet, other planets, stars and galaxies!" />
      <SearchImages />
      <ListImages query={query} currentPage={currentPage} />

    </>

  );
}