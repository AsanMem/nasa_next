export type EmbeddedVideo = { provider: "YouTube" | "Vimeo"; id: string; embed: string; original: string };
export function embeddedVideo(raw?: string): EmbeddedVideo | null {
  if (!raw) return null;
  try {
    const url=new URL(raw); if(url.protocol!=="https:")return null;
    if(["youtu.be","youtube.com","www.youtube.com","www.youtube-nocookie.com"].includes(url.hostname)) {
      const id=url.hostname==="youtu.be"?url.pathname.split("/")[1]:url.searchParams.get("v")||(/^\/(embed|shorts|live)\//.test(url.pathname)?url.pathname.split("/")[2]:"");
      if(!id||!/^[-\w]{11}$/.test(id))return null;
      return {provider:"YouTube",id,embed:`https://www.youtube-nocookie.com/embed/${id}`,original:`https://www.youtube.com/watch?v=${id}`};
    }
    if(["vimeo.com","www.vimeo.com","player.vimeo.com"].includes(url.hostname)) {
      const id=url.pathname.split("/").filter(Boolean).at(-1);
      if(id&&/^\d+$/.test(id))return {provider:"Vimeo",id,embed:`https://player.vimeo.com/video/${id}`,original:`https://vimeo.com/${id}`};
    }
  } catch { /* Unsupported source is offered as an ordinary link. */ }
  return null;
}
export function displayCredit(value?: string) {
  return value?.replace(/^(?:\s*(?:image\s+)?credits?\s*:\s*)+/i,"").trim();
}
