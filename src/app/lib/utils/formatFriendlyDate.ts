
export function formatFriendlyDate(input?: string | Date): string {
  const date =
    input instanceof Date
      ? input
      : input
      ? new Date(input)
      : new Date();

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}
