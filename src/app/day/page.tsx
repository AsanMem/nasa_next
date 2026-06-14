import { fetchApod } from "../lib/nasa/apod";
import { getBuildMarker } from "../lib/build-marker";
import DayClient from "../ui/day/day-client";

export const revalidate = 3600;

export default async function Day() {
  const photoData = await fetchApod()
  const marker = getBuildMarker();
  const fallbackUsed = Boolean(photoData?.url?.startsWith("/") || photoData?.date === "2024-01-01");

  return (
    <DayClient
      photoData={photoData}
      marker={{
        ...marker,
        nasaDate: photoData?.date,
        fallbackUsed,
        revalidateSeconds: 3600,
      }}
    />
  );
}
