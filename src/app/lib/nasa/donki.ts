import { sourceTime } from "../observations/dates";
import { fetchNasaJson, formatDubaiDateTime, getNasaUtcDate } from "./api";

const DONKI_ENDPOINT = "https://ccmc.gsfc.nasa.gov/DONKI-API/get/notifications";
const DONKI_REVALIDATE_SECONDS = 43200;

export type DonkiNotification = {
  messageType?: string;
  messageID?: string;
  messageIssueTime?: string;
  messageURL?: string;
  messageBody?: string;
  messageTitle?: string;
};

type DonkiApiResponse = DonkiNotification[];

export type DonkiNotificationItem = DonkiNotification & {
  formattedTime?: string;
  isFallback?: boolean;
};

const DONKI_FALLBACK_NOTIFICATIONS: DonkiNotificationItem[] = [
  {
    messageType: "Space Weather",
    messageID: "local-donki-fallback-1",
    messageTitle: "Space weather feed temporarily unavailable",
    messageBody:
      "NASA DONKI notifications could not be loaded right now. The app is showing this local fallback so the Space Weather section remains available while the live feed recovers.",
    formattedTime: "Local fallback",
    isFallback: true,
  },
];

export async function fetchDonkiNotifications({
  startDate,
  endDate,
  type = "all",
  limit = 6,
}: {
  startDate?: string;
  endDate?: string;
  type?: string;
  limit?: number;
} = {}): Promise<DonkiNotificationItem[]> {
  const today = getNasaUtcDate();
  const defaultStart = getNasaUtcDate(-7);

  const response = await fetchNasaJson<DonkiApiResponse>(DONKI_ENDPOINT, {
    revalidate: DONKI_REVALIDATE_SECONDS,
    includeApiKey: false,
    validate: value => Array.isArray(value) && value.every(item => item && typeof item.messageID === "string" && typeof item.messageBody === "string"),
    query: {
      startDate: startDate ?? defaultStart,
      endDate: endDate ?? today,
      type,
    },
  });

  if (!response || !Array.isArray(response)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[DONKI] Notification fetch failed or returned invalid data; using static fallback.");
    }
    return DONKI_FALLBACK_NOTIFICATIONS.slice(0, limit);
  }

  return response
    .sort((a, b) => {
      const timeA = sourceTime(a.messageIssueTime) ?? -Infinity;
      const timeB = sourceTime(b.messageIssueTime) ?? -Infinity;
      return timeB - timeA;
    })
    .slice(0, limit)
    .map((item) => ({
      ...item,
      messageBody: item.messageBody?.replace(/[#*\s]/g, "") ? item.messageBody : undefined,
      formattedTime: item.messageIssueTime
        ? formatDubaiDateTime(item.messageIssueTime)
        : undefined,
    }));
}
