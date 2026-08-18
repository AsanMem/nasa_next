import { fetchApod } from "../lib/nasa/apod";
import DayClient from "../ui/day/day-client";

export const revalidate = 3600;

export default async function Day() {
  const photoData = await fetchApod()

  return (
    <DayClient
      photoData={photoData}
      build={{ time: new Date().toISOString(), commit: process.env.GITHUB_SHA?.slice(0, 7) }}
    />
  );
}
