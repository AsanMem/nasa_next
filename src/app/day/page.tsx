import { fetchPictureOfTheDay } from "../lib/data/fetchPictureOfTheDay";
import DayClient from "../ui/day/day-client";


export default async function Day() {
  const photoData = await fetchPictureOfTheDay();
  console.log(photoData, "photoData");

  const fallbackImage =
    "https://firebasestorage.googleapis.com/v0/b/nasa-odisey.appspot.com/o/media%2Flogo%2FNASA_logo.png?alt=media&token=97dc4551-d309-46e9-a660-5b8a58bb179d";

  return (
    <DayClient
      photoData={photoData}
      fallbackImage={fallbackImage}
    />
  );
}