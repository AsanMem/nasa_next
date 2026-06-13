import type { EonetLocation } from "@/app/lib/nasa/eonet-location";

type Props = {
  location: EonetLocation;
};

export function LocationPreview({ location }: Props) {
  const latitude = location.latitude.toFixed(2);
  const longitude = location.longitude.toFixed(2);
  const accessibleLabel = `Location preview: latitude ${latitude}, longitude ${longitude}`;

  return (
    <div className="mt-4 rounded-2xl bg-black/20 p-3 ring-1 ring-white/10">
      <div
        className="relative h-28 overflow-hidden rounded-xl bg-[radial-gradient(circle_at_50%_45%,rgba(14,165,233,0.22),rgba(15,23,42,0.94)_74%)]"
        role="img"
        aria-label={accessibleLabel}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 360 180"
          className="absolute inset-0 h-full w-full text-cyan-100/30"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M52 42l18-12 31 4 13 13-5 18 16 17-8 19-23 5-18-13-15 9-18-11-10-20 8-17 11-12zM112 113l19 6 10 16-12 14-23 5-18-9-5-15 10-13 19-4z"
          />
          <path
            fill="currentColor"
            d="M166 47l21-15 30 5 14 14 24-4 34 12 21 20-5 20-24 4-15 18-26 1-22-12-23 9-24-9-8-20 14-17-11-26zM254 126l20-8 27 8 16 15-8 16-29 6-23-10-10-14 7-13z"
          />
          <path
            fill="currentColor"
            d="M185 110l14 4 7 12-5 14-12 3-10-8-1-14 7-11zM304 100l12-4 13 6 5 12-9 9-14-4-8-9 1-10z"
          />
          <path
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.28"
            strokeWidth="0.8"
            d="M0 45h360M0 90h360M0 135h360M90 0v180M180 0v180M270 0v180"
          />
        </svg>

        <span
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-300 shadow-[0_0_0_5px_rgba(252,165,165,0.2),0_0_18px_rgba(252,165,165,0.85)] ring-2 ring-white"
          style={{
            left: `${location.xPercent}%`,
            top: `${location.yPercent}%`,
          }}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.28em] text-white/50">
          {location.region} · {latitude}, {longitude}
        </p>
        <a
          href={location.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:border-white/40 hover:bg-white/20"
        >
          Open in Maps
        </a>
      </div>
    </div>
  );
}
