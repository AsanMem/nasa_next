import { ROUTES } from "@/app/lib/constants/routes";

export type NewsItem =
  | {
    id: string;
    type: "Space Weather";
    source: "DONKI";
    title: string;
    summary?: string;
    timestamp?: string;
    imageUrls?: string[];
  }
  | {
    id: string;
    type: "Earth Events";
    source: "EONET";
    title: string;
    summary?: string;
    timestamp?: string;
    imageUrls?: string[];
  }
  | {
    id: string;
    type: "Hazardous NEO";
    source: "NeoWS";
    title: string;
    summary?: string;
    timestamp?: string;
    imageUrls?: string[];
  };



export type NasaItem = {
  title: string;
  description: string;
  application: string;
  center: string;
  reference: string;
  patentNumber: string;
  imageUrl: string;
  raw: string[];
};

export type PreviewContent = {
  media?: {
    url: string;
    alt: string;
  };
  gallery?: {
    url: string;
    alt: string;
  }[];
  slideshow?: {
    url: string;
    alt: string;
  }[];
  title: string;
  description?: string;
  metadata?: string;
};
export const PREVIEW_SECTIONS: Array<{
  key: keyof typeof ROUTES;
  title: string;
  description: string;
  href: string;
}> = [
    {
      key: "apod",
      title: "Astronomy Picture of the Day",
      description: "Daily highlights from the cosmos with NASA’s featured imagery.",
      href: ROUTES.apod,
    },
    {
      key: "images",
      title: "NASA Images",
      description: "Curated imagery spanning missions, nebulae, launches, and Earth.",
      href: ROUTES.images,
    },
    {
      key: "videos",
      title: "NASA Videos",
      description: "Mission briefings, launches, and archival footage in motion.",
      href: ROUTES.videos,
    },
    {
      key: "epic",
      title: "EPIC Earth",
      description: "Daily views of Earth captured by the DSCOVR spacecraft.",
      href: ROUTES.epic,
    },
    {
      key: "neos",
      title: "Hazardous NEOs",
      description: "Track near-Earth objects and their approach to our planet.",
      href: ROUTES.neos,
    },
    {
      key: "eonet",
      title: "EONET Earth Events",
      description: "Live geophysical events from NASA and international partners.",
      href: ROUTES.eonet,
    },
  ];



export const SECTION_CARD_CLASS =
  "flex flex-col gap-4 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-lg transition hover:bg-white/10 hover:ring-white/20";

export const BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/20";


  
  export const SPACE_KEYWORDS = [
    // Космические объекты
    "nebula",
    "galaxy",
    "supernova",
    "black hole",
    "quasar",
    "pulsar",
    "star cluster",
    "globular cluster",
   // "open cluster",
    "white dwarf",
    "brown dwarf",
    "exoplanet",
    "binary star",
    "protostar",
  
    // Туманности (популярные для NASA)
    "orion nebula",
    "eagle nebula",
    "crab nebula",
    "helix nebula",
    "ring nebula",
    "lagoon nebula",
    "carina nebula",
    " trifid nebula",
  
    // Галактики
    "milky way",
    "andromeda galaxy",
    "spiral galaxy",
    "elliptical galaxy",
    "barred galaxy",
    "dwarf galaxy",
    "starburst galaxy",
  
    // Планеты и спутники
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "venus",
    "mercury",
    "pluto",
  
    // Миссии NASA / аппараты
    "james webb",
    "jwst",
    "hubble",
    "hubble deep field",
    "voyager",
    "apollo",
    "artemis",
    "cassini",
    "galileo spacecraft",
    "new horizons",
    "kepler telescope",
    "tess telescope",
    "soho spacecraft",
    "chandra x-ray",
  
    // Земля / наблюдение
    "earth from space",
    "hurricane from space",
    "earth night lights",
    "aurora",
    "polar lights",
    "atmospheric phenomena",
    "volcano from space",
  
    // КОСМИЧЕСКИЕ ЯВЛЕНИЯ
    "eclipse",
    "solar eclipse",
    "lunar eclipse",
    "solar flare",
    "coronal mass ejection",
    "meteor shower",
    "comet",
    "asteroid",
    "near earth object",
    "cosmic rays",
  
    // Астрофизика
    "dark matter",
    "dark energy",
    "interstellar dust",
    "gravitational waves",
    "magnetosphere",
  
    // Люди / техника NASA
    "astronaut",
    "space station",
    "iss",
    "eva spacewalk",
    "launch",
    "rocket launch",
    "space shuttle",
    "satellite",
    "mission control",
    "nasa training",
  
    // Дополнительное крутое
    "deep space",
    "cosmic nebula",
    "starlight",
    "cosmic landscape",
    "planetary surface",
    "lunar surface",
    "mars rover",
    "curiosity rover",
    "perseverance rover",
    "ingenuity helicopter",
  ];
  