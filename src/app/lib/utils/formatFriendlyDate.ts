
export function formatFriendlyDate(input?: string | Date): string {
  const date =
    input instanceof Date
      ? input
      : input
      ? new Date(input)
      : new Date();

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const year = date.getUTCFullYear();

  return `${day} ${month} ${year}`;
}
