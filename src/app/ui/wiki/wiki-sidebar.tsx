import Image from "next/image";
import type { WikiArticle } from "@/app/lib/wiki";

type WikiSidebarProps = {
  articles: WikiArticle[];
};

const CARD_CLASS =
  "flex gap-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/10 hover:ring-white/20";

export default function WikiSidebar({ articles }: WikiSidebarProps) {
  if (!articles || articles.length === 0) {
    return (
      <div className="text-readable rounded-3xl bg-white/5 p-6 text-sm text-white/50 ring-1 ring-white/10">
        Wikipedia insights will appear here once you start searching.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <a
          key={article.id}
          href={article.url}
          target="_blank"
          rel="noreferrer"
          className={CARD_CLASS}
        >
          {article.thumbnailUrl ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
              <Image
                src={article.thumbnailUrl}
                alt={article.title}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">
              Wikipedia
            </span>
            <p className="truncate text-sm font-semibold text-white">{article.title}</p>
            {article.extract ? (
              <p
                className="text-readable text-sm text-white/70"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {article.extract}
              </p>
            ) : null}
          </div>
        </a>
      ))}
    </div>
  );
}
