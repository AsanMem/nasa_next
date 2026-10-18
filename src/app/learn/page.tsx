import { pageMetadata } from "@/app/lib/site";
import LessonLibrary from "../ui/learn/lesson-library";
export const metadata=pageMetadata("/learn","NASA astronomy lessons for teachers | Orbital","Five curated 40-minute astronomy lessons for ages 11–14, with NASA images, videos, reading and printable lesson plans.");
export default function LearnPage(){return <LessonLibrary/>;}
