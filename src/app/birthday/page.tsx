import { pageMetadata } from "@/app/lib/site";
import BirthdayHub from "../ui/day/birthday-hub";
export const metadata=pageMetadata("/birthday","Your birth sky in 3D & a star map poster | Orbital","Enter your birth date, time and city to explore the calculated sky in 3D and create a personal star map poster for printing.");
export default function BirthdayPage(){return <BirthdayHub/>;}
