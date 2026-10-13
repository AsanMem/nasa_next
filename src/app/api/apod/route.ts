import { fetchApodResult, validApodDate } from "../../lib/nasa/apod";

// POST keeps the chosen date out of browser history and request-URL logs.
export async function POST(request: Request) {
  try {
    if (Number(request.headers.get("content-length")) > 256) return Response.json({ outcome: "invalid-data" }, { status: 400 });
    const input = await request.json();
    if (typeof input.date !== "string" || !validApodDate(input.date)) return Response.json({ outcome: "invalid-data" }, { status: 400 });
    const result = await fetchApodResult(input.date);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ data: null, outcome: "unavailable" }, { status: 503 });
  }
}
