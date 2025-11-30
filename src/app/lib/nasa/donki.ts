import { fetchNasaJson, formatDubaiDateTime } from "./api";
import { formatDate } from "../utils";

const DONKI_ENDPOINT = "https://api.nasa.gov/DONKI/notifications";
const DONKI_REVALIDATE_SECONDS = 60 * 30; // 30 minutes

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
};

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
  const today = formatDate();
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 7);

  const response = await fetchNasaJson<DonkiApiResponse>(DONKI_ENDPOINT, {
    revalidate: DONKI_REVALIDATE_SECONDS,
    query: {
      startDate: startDate ?? formatDate(defaultStart),
      endDate: endDate ?? today,
      type,
    },
  });

  if (!response || !Array.isArray(response)) {
    return [];
  }

  return response
    .sort((a, b) => {
      const timeA = a.messageIssueTime ? new Date(a.messageIssueTime).getTime() : 0;
      const timeB = b.messageIssueTime ? new Date(b.messageIssueTime).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, limit)
    .map((item) => ({
      ...item,
      formattedTime: item.messageIssueTime
        ? formatDubaiDateTime(item.messageIssueTime)
        : undefined,
    }));
}

