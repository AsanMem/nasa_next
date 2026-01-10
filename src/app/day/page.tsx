'use server'
import { fetchApod } from "../lib/nasa/apod";
import DayClient from "../ui/day/day-client";


export default async function Day() {
  const photoData = await fetchApod()

  return (
    <DayClient photoData={photoData} />
  );
}