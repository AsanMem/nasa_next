"use client";
import Link from "next/link";
import { useState } from "react";
import type { ApodItem } from "../../lib/nasa/apod";
import { apodExhibit } from "../../lib/observations/apod";
import { displayCredit } from "../../lib/observations/video";
import { sanitizePlainText } from "../../lib/utils/text";
import { Chapter, ChapterHeading, EmptyState } from "../orbital/chapter";
import MediaImage from "../orbital/media-image";
import MediaViewer from "../orbital/media-viewer";
import ExternalVideo from "./external-video";
import s from "../orbital/chapters.module.css";
import orbital from "../orbital/orbital.module.css";

export default function DayClient({photoData,build,embedded=false}:{photoData:ApodItem|null;build:{time:string;commit?:string};embedded?:boolean}) {
  const Container=embedded?"section":Chapter,[open,setOpen]=useState(false);
  photoData=apodExhibit(photoData);
  const title=sanitizePlainText(photoData?.title)||"Media of the day",explanation=sanitizePlainText(photoData?.explanation);
  const fallback=!!photoData?.url?.startsWith("/"),image=photoData?.media_type==="image";
  const source=image?photoData?.hdurl||photoData?.url:photoData?.url;
  const external=/^https?:\/\//i.test(source||"")?source:undefined;
  const credit=displayCredit(photoData?.copyright);
  const date=photoData?.date;
  return <Container>
    {embedded?<header className={s.embeddedHeading}><h2>{title}</h2>{date&&<p className={s.meta}>NASA publication · <time dateTime={date}>{date}</time></p>}</header>:<ChapterHeading compact label="Media of the day" title={fallback?"The daily source is unavailable":title}><div className={s.meta}>{!fallback&&date&&<span>NASA publication · <time dateTime={date}>{date}</time></span>}<span>{fallback?"Illustrative archive image":image?"Image":"Video"}</span></div></ChapterHeading>}
    {!photoData?<EmptyState title="The daily observation is unavailable"><p>NASA did not return this publication.</p><div className={s.actions}><button className={`${orbital.button} ${orbital.quiet}`} onClick={()=>window.location.reload()}>Try again</button><Link className={s.textLink} href="/gallery">Explore images ↗</Link></div></EmptyState>:<>
      <figure className={s.dailyFigure}>
        {image?<button type="button" className={s.dailyImage} aria-label={fallback?"View illustrative archive image":`Enlarge image: ${title}`} aria-haspopup="dialog" onClick={()=>{if(!fallback)setOpen(true);}} disabled={fallback}>
          <span className={s.imageAtmosphere} aria-hidden="true"><MediaImage src={photoData.url} alt="" loading="eager"/></span>
          <MediaImage src={photoData.url} fallbackSrc={photoData.hdurl} alt={title} loading="eager"/>
          {!fallback&&<span className={s.enlargeHint} aria-hidden="true">⤢ Enlarge</span>}
        </button>:/\.(mp4|webm)(?:[?#]|$)/i.test(photoData.url||"")?<video className={s.dailyVideo} src={photoData.url} controls playsInline preload="none" poster={photoData.thumbnail_url} aria-label={title}/>:photoData.url?<ExternalVideo key={photoData.url} url={photoData.url} title={title}/>:<p>Video unavailable.</p>}
        <figcaption className={s.caption}>{fallback?"Illustrative image from the local archive; not today's NASA observation.":credit?`Credit: ${credit}`:"Credits: see NASA source."}</figcaption>
      </figure>
      <div className={s.observationDetails}>
        <details><summary>About this observation</summary><p>{fallback?"The daily source is unavailable. This local image is illustrative.":explanation||"NASA has not supplied an explanation for this publication."}</p></details>
        <details><summary>Source & credits</summary>{credit&&<p>{credit}</p>}{photoData.sourceUrl&&<a href={photoData.sourceUrl} className={s.textLink} target="_blank" rel="noopener noreferrer">NASA publication ↗</a>}{!image&&external&&/\.(mp4|webm)(?:[?#]|$)/i.test(external)&&<p><a href={external} className={s.textLink} target="_blank" rel="noopener noreferrer">Original video source ↗</a></p>}{!embedded&&<p className={s.caption}>Page generated {new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeStyle:"short",timeZone:"UTC"}).format(new Date(build.time))} UTC. Publication dates are separate from observation dates.</p>}</details>
      </div>
    </>}
    {open&&<MediaViewer kind="image" src={source} preview={photoData?.url} source={external} sourceRecord={photoData?.sourceUrl} credit={credit} title={title} description={explanation} onClose={()=>setOpen(false)}/>}
  </Container>;
}
