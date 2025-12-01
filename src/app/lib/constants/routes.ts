export const ROUTES = {
  apod: "/day",
  images: "/gallery",
  videos: "/video",
  epic: "/epic",
  neos: "/asteroids",
  techport: "/techport",
  techtransfer: "/techtransfer",
  spaceWeather: "/space-weather",
  eonet: "/eonet",
  library: "/library",
} as const;

export type RouteKey = keyof typeof ROUTES;
