
"use client"
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

// { customers }: { customers: CustomerField[] }
export default function SearchImages() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const handleSearch = useDebouncedCallback((term) => {

        const params = new URLSearchParams(searchParams);
        params.set('page', '1');
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`);

    }, 300);
    return (<div className="flex flex-wrap justify-center">
        <form className="pt-5 w-full md:w-96 text-center flex items-center justify-center">
            <input
                placeholder="Enter the title"

                className="w-full py-2 pl-4 rounded-l-lg border border-gray-300 focus:outline-none focus:border-slate-900"
                onChange={(e) => {
                    handleSearch(e.target.value);
                }}
                defaultValue={searchParams.get('query')?.toString()}
            />
            <button
                className="py-2 px-4 bg-slate-900 text-gray-300 rounded-r-lg hover:bg-slate-500 focus:outline-none focus:bg-slate-300 align-middle h-full"
                type='button'
            >
                SEARCH
            </button>
        </form>
    </div>)



}