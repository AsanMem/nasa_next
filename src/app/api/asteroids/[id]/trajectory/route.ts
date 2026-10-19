import { getAsteroid } from "@/app/lib/data/asteroids/getAsteroid";
import { getNasaUtcDate } from "@/app/lib/nasa/api";
import { selectApproach, toAsteroid, validDate } from "@/app/lib/asteroids/view-model";
import { getVerifiedTrajectory } from "@/app/lib/asteroids/server/trajectory-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const headers = { "Cache-Control": "no-store" };
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const deadlineUtcMs = Date.now() + 55_000;
  const url = new URL(request.url), key = url.searchParams.get("event"), date = url.searchParams.get("date");
  if (!/^\d{1,12}$/.test(params.id) || (date !== null && !validDate(date)) || (key !== null && (key.length > 180 || !/^[\w .-]+$/.test(key)))) return Response.json({ status: "unavailable", reason: "invalid-request", message: "Choose a valid NASA encounter." }, { status: 400, headers });
  const asteroid = toAsteroid(await getAsteroid(params.id));
  if (!asteroid) return Response.json({ status: "unavailable", reason: "nasa-unavailable", message: "NASA object data is temporarily unavailable." }, { status: 503, headers });
  const event = key ? asteroid.approaches.find(item => item.key === key) : selectApproach(asteroid.approaches, date, getNasaUtcDate());
  if (!event || (date && event.date !== date)) return Response.json({ status: "unavailable", reason: "event-unavailable", message: "This encounter record changed. Reload the object to choose it again." }, { status: 404, headers });
  const result = await getVerifiedTrajectory(asteroid, event, { deadlineUtcMs });
  return Response.json(result, { status: result.status === "pending" ? 202 : result.status === "ready" ? 200 : 503, headers: { ...headers, ...(result.status === "pending" ? { "Retry-After": String(Math.ceil(result.retryAfterMs / 1000)) } : {}) } });
}
