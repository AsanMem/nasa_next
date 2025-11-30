export const ROUTES = {
  apod: "/apod",
  images: "/images",
  videos: "/videos",
  epic: "/epic",
  neos: "/neos",
  techport: "/techport",
  techtransfer: "/techtransfer",
  spaceWeather: "/space-weather",
  eonet: "/eonet",
  library: "/library",
} as const;

export type RouteKey = keyof typeof ROUTES;

