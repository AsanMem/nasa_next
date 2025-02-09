
"use client"
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function SearchData() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const handleSearch = useDebouncedCallback((term) => {

        const params = new URLSearchParams(searchParams as any);
        params.set('page', '1');
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        replace(`${pathname}?${params.toString()}`);

    }, 300);

    const handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch(e.target.value);
        }
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        handleSearch(e.target.query.value);
    };

    return (<div className="flex flex-wrap justify-center">
        <form onSubmit={handleSubmit} className="pt-5 w-full md:w-96 text-center flex items-center justify-center">
            <input
                placeholder="Enter the title"

                className="w-full py-2 pl-4 rounded-l-lg border border-gray-300 focus:outline-none focus:border-slate-900"
                onChange={(e) => {
                    handleSearch(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                defaultValue={searchParams.get('query')?.toString()}
            />
            <button
                className="py-2 px-4 bg-slate-900 text-gray-300 rounded-r-lg hover:bg-slate-500 focus:outline-none focus:bg-slate-300 align-middle h-full"
                type='submit'
            >
                SEARCH
            </button>
        </form>
    </div>)



}