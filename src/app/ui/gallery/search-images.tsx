"use client";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function SearchData() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams as any);
        params.set("page", "1");

        if (term?.trim()) params.set("query", term.trim());
        else params.delete("query");

        replace(`${pathname}?${params.toString()}`);
    }, 300);

    const handleKeyDown = (e: any) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch(e?.target?.value);
        }
    };

    const handleSubmit = (e: any) => {
        e.preventDefault();
        handleSearch(e?.target?.query?.value);
    };

    const tips = ["nebula", "earth night lights", "galaxy", 'andromeda'];

    return (
        <div className="flex justify-center">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-2xl"
            >
                <div
                    className="
            flex items-center gap-2
            rounded-full bg-white/5 p-2
            ring-1 ring-white/10 backdrop-blur
            transition
            focus-within:ring-white/20
          "
                >
                    <input
                        name="query"
                        placeholder="Search the NASA library…"
                        className="
              h-11 w-full bg-transparent px-4
              text-readable text-sm text-white placeholder:text-white/40
              outline-none
            "
                        onChange={(e) => handleSearch(e.target.value)}
                        onKeyDown={handleKeyDown}
                        defaultValue={searchParams.get("query")?.toString()}
                        autoComplete="off"
                        spellCheck={false}
                    />

                    <button
                        className="
              h-11 shrink-0 rounded-full
              border border-white/20 bg-white/10
              px-5 text-xs font-semibold uppercase tracking-[0.35em] text-white
              transition
              hover:border-white/40 hover:bg-white/20
              focus:outline-none
            "
                        type="submit"
                    >
                        Search
                    </button>
                </div>

                {!searchParams.get("query") && (
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                        <span className="text-readable text-xs text-white/40  py-1">Try:</span>

                        {tips.map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => handleSearch(t)}
                                className="
          rounded-full bg-white/5 px-3 py-1
          text-readable text-xs text-white/60
          ring-1 ring-white/10 backdrop-blur
          transition
          hover:bg-white/10 hover:text-white hover:ring-white/20
        "
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                )}

            </form>
        </div>
    );
}
