import { fetchPictureOfTheDay } from "../lib/data/fetchPictureOfTheDay";
import DayClient from "../ui/day/day-client";


export default async function Day() {
  const photoData = await fetchPictureOfTheDay();

  const fallbackImage =
    "https://firebasestorage.googleapis.com/v0/b/nasa-odisey.appspot.com/o/media%2Fbg%2F4.jpg?alt=media&token=95f397e8-b32c-46f1-aa44-beabb28dc15c"
  return (
    <DayClient
      photoData={photoData}
      fallbackImage={fallbackImage}
    />
  );
}