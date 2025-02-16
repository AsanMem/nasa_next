import Image from 'next/image';
import CardImage from './card-image';

import { fetchFilteredImages } from '@/app/lib/data/fetchFilteredImages';
import Pagination from '../shared/pagination';
import CardTopic from './card-topic';

export default async function ListImages({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {

  let { gallery, totalPages } = await fetchFilteredImages(query, currentPage) || { gallery: [], totalPages: 0 };

  if (query === "") {
    return <></>;
  }

  return (
    <>
      {gallery && gallery.length > 0 ? (
        <div className={"mt-35 flex flex-wrap content-around justify-evenly items-stretch"}>
          {gallery.map((img: any, i: number) => (
            <CardTopic topic={img} key={img.data[0].title + i}

            />
          ))}
          <div className="mt-5 flex w-full justify-center">
            <Pagination totalPages={totalPages} />
          </div>
        </div>
      ) : (
        <div className={"mt-35 flex flex-wrap content-around justify-evenly items-stretch"}>
          <div className="text-2xl text-slate-300 flex items-center justify-between pb-4 my-8">
            'This is not found :('
          </div>
        </div>
      )}
    </>
  );
}