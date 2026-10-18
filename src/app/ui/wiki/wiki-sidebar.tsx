import type { WikiArticle } from "@/app/lib/wiki";
import s from "../orbital/chapters.module.css";
import MediaImage from "../orbital/media-image";

export default function WikiSidebar({ articles }: { articles: WikiArticle[] }) {
  return <aside className={s.sidebar} aria-labelledby="reading-title"><h2 id="reading-title">A little more context</h2><p>Related reading from Wikipedia. These links open outside Orbital.</p>
    {articles?.length ? <div>{articles.map(article => <a className={s.readingLink} href={article.url} key={article.id} target="_blank" rel="noopener noreferrer">{article.thumbnailUrl&&<MediaImage className={s.readingThumbnail} src={article.thumbnailUrl} alt="" loading="lazy"/>}<h3>{article.title}</h3>{article.extract && <p>{article.extract}</p>}</a>)}</div> : <p>Related articles will appear when available for your search.</p>}
  </aside>;
}
