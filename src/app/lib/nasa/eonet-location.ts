import type { EonetGeometry } from "./eonet";

export type EonetLocation = {
  latitude: number;
  longitude: number;
  xPercent: number;
  yPercent: number;
  mapsUrl: string;
  region: string;
};

type CoordinatePair = [number, number];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function isValidCoordinate(longitude: number, latitude: number) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function isCoordinatePair(value: unknown): value is CoordinatePair {
  return (
    Array.isArray(value) &&
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    isValidCoordinate(value[0], value[1])
  );
}

function collectCoordinatePairs(value: unknown, pairs: CoordinatePair[] = []) {
  if (isCoordinatePair(value)) {
    pairs.push([value[0], value[1]]);
    return pairs;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectCoordinatePairs(item, pairs));
  }

  return pairs;
}

function getGeometryCenter(geometry: EonetGeometry): CoordinatePair | undefined {
  if (geometry.type === "Point" && isCoordinatePair(geometry.coordinates)) {
    return geometry.coordinates;
  }

  const pairs = collectCoordinatePairs(geometry.coordinates);
  if (pairs.length === 0) {
    return undefined;
  }

  const bounds = pairs.reduce(
    (acc, [longitude, latitude]) => ({
      minLongitude: Math.min(acc.minLongitude, longitude),
      maxLongitude: Math.max(acc.maxLongitude, longitude),
      minLatitude: Math.min(acc.minLatitude, latitude),
      maxLatitude: Math.max(acc.maxLatitude, latitude),
    }),
    {
      minLongitude: Number.POSITIVE_INFINITY,
      maxLongitude: Number.NEGATIVE_INFINITY,
      minLatitude: Number.POSITIVE_INFINITY,
      maxLatitude: Number.NEGATIVE_INFINITY,
    },
  );

  const longitude = (bounds.minLongitude + bounds.maxLongitude) / 2;
  const latitude = (bounds.minLatitude + bounds.maxLatitude) / 2;

  return isValidCoordinate(longitude, latitude) ? [longitude, latitude] : undefined;
}

export function buildGoogleMapsUrl(latitude: number, longitude: number) {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export function resolveApproxRegionFromCoordinates(latitude: number, longitude: number) {
  if (latitude <= -60) return "Antarctica";
  if (latitude >= 66.5) return "Arctic region";

  if (latitude >= 7 && latitude <= 84 && longitude >= -170 && longitude <= -50) {
    return "North America";
  }

  if (latitude >= -56 && latitude <= 13 && longitude >= -82 && longitude <= -34) {
    return "South America";
  }

  if (latitude >= 35 && latitude <= 72 && longitude >= -25 && longitude <= 45) {
    return "Europe";
  }

  if (latitude >= -35 && latitude <= 38 && longitude >= -20 && longitude <= 52) {
    return "Africa";
  }

  if (latitude >= 5 && latitude <= 80 && longitude >= 45 && longitude <= 180) {
    return "Asia";
  }

  if (latitude >= -50 && latitude <= 5 && longitude >= 110 && longitude <= 180) {
    return "Oceania";
  }

  if (latitude >= -45 && latitude <= 30 && longitude >= 20 && longitude <= 120) {
    return "Indian Ocean region";
  }

  if (longitude <= -70 || longitude >= 120) {
    return "Pacific region";
  }

  return "Atlantic region";
}

export function resolveEonetLocation(geometries?: EonetGeometry[]): EonetLocation | undefined {
  const sortedGeometries = [...(geometries ?? [])].sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    return timeB - timeA;
  });

  for (const geometry of sortedGeometries) {
    const center = getGeometryCenter(geometry);
    if (!center) continue;

    const [longitude, latitude] = center;
    const xPercent = clamp(((longitude + 180) / 360) * 100, 0, 100);
    const yPercent = clamp(((90 - latitude) / 180) * 100, 0, 100);

    return {
      latitude,
      longitude,
      xPercent,
      yPercent,
      mapsUrl: buildGoogleMapsUrl(latitude, longitude),
      region: resolveApproxRegionFromCoordinates(latitude, longitude),
    };
  }

  return undefined;
}
