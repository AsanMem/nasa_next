import Link from "next/link";
import { BUTTON_CLASS, SECTION_CARD_CLASS } from "./constants";

export type RubricCardItem = {
    title: string;
    detail?: string;
    meta?: string;
    imageUrl?: string;
};

type RubricCardProps = {
    title: string;
    description: string;
    href: string;
    items: RubricCardItem[];
};




export function RubricCard({ title, description, href, items }: RubricCardProps) {
    return (
        <div className={SECTION_CARD_CLASS}>
            <div className="flex flex-col gap-3">
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">New Section</p>
                <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
                <p className="text-sm text-white/70">{description}</p>
            </div>

            <ul className="mt-4 flex flex-col gap-4 text-sm text-white/80">
                {items.length > 0 ? (
                    items.slice(0, 4).map((item) => (
                        <li
                            key={item.title}
                            className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"
                        >
                            <p className="font-semibold text-white">{item.title}</p>

                            {item.imageUrl ? (
                                <div className="mt-3 overflow-hidden rounded-xl border border-white/10">

                                    {/* import Image from "next/image"; */}
                                    {/* <Image src={item.imageUrl} alt={item.title} width={600} height={400} className="h-auto w-full object-cover" /> */}
                                    <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="h-auto w-full object-cover"
                                    />
                                </div>
                            ) : null}
                            {item.detail ? (
                                <div
                                    className={`
                    mt-2 text-white/70 text-sm
                    prose prose-invert prose-sm max-w-none
                    [&_.highlight]:text-amber-300
                    [&_.highlight]:font-semibold
                  `}
                                    dangerouslySetInnerHTML={{ __html: item.detail }}
                                />
                            ) : null}

                            {item.meta ? (
                                <p className="mt-2 text-xs uppercase tracking-[0.4em] text-white/40">
                                    {item.meta}
                                </p>
                            ) : null}
                        </li>
                    ))
                ) : (
                    <li className="rounded-2xl bg-white/5 p-4 text-white/50 ring-1 ring-white/10">
                        Data not available right now. Check the full section for more.
                    </li>
                )}
            </ul>

            <div className="mt-auto pt-4">
                <Link href={href} className={BUTTON_CLASS}>
                    Open
                </Link>
            </div>
        </div>
    );
}
