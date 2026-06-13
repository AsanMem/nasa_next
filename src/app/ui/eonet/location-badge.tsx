import type { EonetLocation } from "@/app/lib/nasa/eonet-location";

type Props = {
  location: EonetLocation;
};

export function LocationBadge({ location }: Props) {
  const latitude = location.latitude.toFixed(2);
  const longitude = location.longitude.toFixed(2);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
      <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-cyan-100 ring-1 ring-cyan-200/15">
        {location.region} · {latitude}, {longitude}
      </span>
      <a
        href={location.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-white/10 px-3 py-1 text-white/70 transition hover:bg-white/20 hover:text-white"
      >
        Open in Maps
      </a>
    </div>
  );
}
