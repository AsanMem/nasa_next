import Image from "next/image";
import { CATEGORY_ICON_MAP } from "./constants";

type Props = {
    category?: string;
    compact?: boolean;
};

export function EventVisual({ category, compact }: Props) {
    const icon = category
        ? CATEGORY_ICON_MAP[category]
        : CATEGORY_ICON_MAP.Warning;

    if (!icon) return null;

    return (
        <div
            className={[
                "flex items-center justify-center rounded-xl border border-white/10 bg-white/5",
                compact ? "h-16 w-16 shrink-0" : "p-8",
            ].join(" ")}
        >
            <Image
                src={icon}
                alt={category ?? "Event type"}
                width={compact ? 32 : 96}
                height={compact ? 32 : 96}
                className="opacity-80"
            />
        </div>
    );
}
