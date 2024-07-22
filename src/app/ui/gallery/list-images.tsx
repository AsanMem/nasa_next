import Image from 'next/image';
import CardImage from './card-image';

import { fetchFilteredImages } from '@/app/lib/data/fetchFilteredImages';
import Pagination from '../shared/pagination';

export default async function ListImages({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {

  let { gallery, totalPages } = await fetchFilteredImages(query, currentPage)

  if (query === "") {
    return <></>
  }

  return (<>

    {gallery && gallery.length > 0 ?
      <div className={"mt-35 flex flex-wrap content-around justify-evenly items-stretch"}>
        {gallery.map((img, i) => {
          // console.log(img.data[0]?.keywords, "img")
          return (
            <CardImage
              key={img.data[0].title + i}
              nasaPicture={img.links[0].href}
              title={img.data[0].title}
              description={img.data[0].description}
              keywords={img.data[0]?.keywords}
            />
          )
        })}
        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      </div>

      : <div className={"mt-35 flex flex-wrap content-around justify-evenly items-stretch"}><div className="text-2xl text-slate-300 flex items-center justify-between  pb-4 my-8"> 'This is not found :('</div></div>
    }
  </>



    // <div className="mt-6 flow-root">
    //   <div className="inline-block min-w-full align-middle">
    //     <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
    //       <div className="md:hidden">
    //         {/* {invoices?.map((invoice) => (
    //           <div
    //             key={invoice.id}
    //             className="mb-2 w-full rounded-md bg-white p-4"
    //           >
    //             <div className="flex items-center justify-between border-b pb-4">
    //               <div>
    //                 <div className="mb-2 flex items-center">
    //                   <Image
    //                     src={invoice.image_url}
    //                     className="mr-2 rounded-full"
    //                     width={28}
    //                     height={28}
    //                     alt={`${invoice.name}'s profile picture`}
    //                   />
    //                   <p>{invoice.name}</p>
    //                 </div>
    //                 <p className="text-sm text-gray-500">{invoice.email}</p>
    //               </div>
    //               <InvoiceStatus status={invoice.status} />
    //             </div>
    //             <div className="flex w-full items-center justify-between pt-4">
    //               <div>
    //                 <p className="text-xl font-medium">
    //                   {formatCurrency(invoice.amount)}
    //                 </p>
    //                 <p>{formatDateToLocal(invoice.date)}</p>
    //               </div>
    //               <div className="flex justify-end gap-2">
    //                 <UpdateInvoice id={invoice.id} />
    //                 <DeleteInvoice id={invoice.id} />
    //               </div>
    //             </div>
    //           </div>
    //         ))} */}
    //       </div>
    //       <table className="hidden min-w-full text-gray-900 md:table">
    //         <thead className="rounded-lg text-left text-sm font-normal">
    //           <tr>
    //             <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
    //               Customer
    //             </th>
    //             <th scope="col" className="px-3 py-5 font-medium">
    //               Email
    //             </th>
    //             <th scope="col" className="px-3 py-5 font-medium">
    //               Amount
    //             </th>
    //             <th scope="col" className="px-3 py-5 font-medium">
    //               Date
    //             </th>
    //             <th scope="col" className="px-3 py-5 font-medium">
    //               Status
    //             </th>
    //             <th scope="col" className="relative py-3 pl-6 pr-3">
    //               <span className="sr-only">Edit</span>
    //             </th>
    //           </tr>
    //         </thead>
    //         <tbody className="bg-white">
    //           {/* {invoices?.map((invoice) => (
    //             <tr
    //               key={invoice.id}
    //               className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
    //             >
    //               <td className="whitespace-nowrap py-3 pl-6 pr-3">
    //                 <div className="flex items-center gap-3">
    //                   <Image
    //                     src={invoice.image_url}
    //                     className="rounded-full"
    //                     width={28}
    //                     height={28}
    //                     alt={`${invoice.name}'s profile picture`}
    //                   />
    //                   <p>{invoice.name}</p>
    //                 </div>
    //               </td>
    //               <td className="whitespace-nowrap px-3 py-3">
    //                 {invoice.email}
    //               </td>
    //               <td className="whitespace-nowrap px-3 py-3">
    //                 {formatCurrency(invoice.amount)}
    //               </td>
    //               <td className="whitespace-nowrap px-3 py-3">
    //                 {formatDateToLocal(invoice.date)}
    //               </td>
    //               <td className="whitespace-nowrap px-3 py-3">
    //                 <InvoiceStatus status={invoice.status} />
    //               </td>
    //               <td className="whitespace-nowrap py-3 pl-6 pr-3">
    //                 <div className="flex justify-end gap-3">
    //                   <UpdateInvoice id={invoice.id} />
    //                   <DeleteInvoice id={invoice.id} />
    //                 </div>
    //               </td>
    //             </tr>
    //           ))} */}
    //         </tbody>
    //       </table>
    //     </div>
    //   </div>
    // </div>
  );
}
