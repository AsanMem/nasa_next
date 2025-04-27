'use server'
import { fetchPictureOfTheDay } from "../lib/data/day/fetchPictureOfTheDay";
import DayClient from "../ui/day/day-client";
import Header from "../ui/header/Header";


export default async function Day() {
  const photoData = await fetchPictureOfTheDay();


  return (
    <><Header />
      <DayClient
        photoData={photoData}
      /></>
  );
}