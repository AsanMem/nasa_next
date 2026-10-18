"use client";
import { useState } from "react";
import { lessonPacks } from "../../lib/lessons/registry";
import { Chapter, ChapterHeading } from "../orbital/chapter";
import MediaImage from "../orbital/media-image";
import s from "../orbital/chapters.module.css";
import orbital from "../orbital/orbital.module.css";

export default function LessonLibrary(){
  const [id,setId]=useState(lessonPacks[0].id);
  const lesson=lessonPacks.find(item=>item.id===id)!;
  return <Chapter><div className={s.lessonControls}><ChapterHeading compact title="For teachers"><p className={s.caption}>Five ready-to-use lessons · Ages 11–14 · 40 minutes</p></ChapterHeading><label className={s.lessonSelect}>Topic<select value={id} onChange={event=>setId(event.target.value)}>{lessonPacks.map(item=><option key={item.id} value={item.id}>{item.id==="moon"?"The Moon":item.id==="sun"?"The Sun":item.id==="earth"?"Earth":item.id==="asteroids"?"Asteroids":"Galaxies"}</option>)}</select></label></div>
    <article className={s.lesson} aria-labelledby="lesson-title"><header><div><p className={s.printOnly}>Orbital · For teachers · Ages {lesson.ages} · {lesson.minutes} minutes</p><h2 id="lesson-title">{lesson.title}</h2></div><button className={`${orbital.button} ${orbital.quiet} ${s.noPrint}`} onClick={()=>window.print()}>Print lesson ↗</button></header><p><strong>Learning goal.</strong> {lesson.objective}</p><p className={s.caption}>You need paper, pens and a shared screen. The materials for each activity are linked directly below it.</p>
      <h3>Lesson plan</h3><ol className={s.lessonStages}>{lesson.stages.map(stage=><li key={stage.title}><h4><span>{stage.minutes} min</span>{stage.title}</h4><p>{stage.activity}</p><div className={s.stageResources}>{stage.resources?.map(id=>{const resource=lesson.resources.find(item=>item.id===id)!;return <div className={s.stageResource} data-kind={resource.kind} key={id}><a href={resource.source} target="_blank" rel="noopener noreferrer">{resource.preview&&<MediaImage src={resource.preview} alt="" className={resource.kind==="video"?s.lessonVideoPreview:undefined}/>}<span><small>{resource.kind==="page"?"Read":resource.kind==="video"?"Watch video":"View image"}</small>{resource.shortTitle||resource.title}<span aria-hidden="true"> ↗</span></span></a>{resource.credit&&<p className={s.caption}>{resource.credit}</p>}<p className={s.printOnly}>{resource.source}</p></div>;})}</div></li>)}</ol>
      <h3>Discussion questions</h3><ol>{lesson.questions.map(question=><li key={question}>{question}</li>)}</ol><h3>Exit task</h3><p>{lesson.exitTask}</p><aside className={s.teacherNote}><h4>Teaching note</h4><p>{lesson.note}</p></aside>
    </article></Chapter>;
}
