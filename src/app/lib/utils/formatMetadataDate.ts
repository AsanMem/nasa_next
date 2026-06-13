const MONTH_SHORT = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

export function formatMetadataDate(
    raw?: string | null,
    { includeTime = false }: { includeTime?: boolean } = {},
): string | undefined {
    if (!raw || !raw.trim()) {
        return undefined;
    }
    const value = raw.trim();

   
    const targetPattern = /^\d{2} [A-Za-z]{3} \d{4}(?:, \d{2}:\d{2})?$/;
    if (targetPattern.test(value)) {
        return includeTime ? value : value.replace(/,\s*\d{2}:\d{2}$/, "");
    }

    let date: Date | null = null;

   
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
        const iso = value.endsWith("Z") ? value : value + "Z";
        const d = new Date(iso);
        if (!isNaN(d.getTime())) date = d;
    }

   
    if (!date && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
        const isoLike = value.replace(" ", "T") + "Z";
        const d = new Date(isoLike);
        if (!isNaN(d.getTime())) date = d;
    }

  
    if (!date) {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
            date = d;
        }
    }

   
    if (!date) {
        return raw;
    }

   
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = MONTH_SHORT[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    if (!includeTime) {
        return `${day} ${month} ${year}`;
    }

    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
}
