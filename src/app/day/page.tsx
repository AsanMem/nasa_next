import { fetchApod } from "../lib/nasa/apod";
import DayClient from "../ui/day/day-client";

export const revalidate = 43200;

export default async function Day() {
  const photoData = await fetchApod()

  return (
    <DayClient photoData={photoData} />
  );
}
