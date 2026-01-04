'use server'
import { fetchPictureOfTheDay } from "../lib/data/day/fetchPictureOfTheDay";
import DayClient from "../ui/day/day-client";


export default async function Day() {
  const photoData = await fetchPictureOfTheDay();


  return (
    <DayClient photoData={photoData} />
  );
}