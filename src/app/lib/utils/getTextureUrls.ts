const ASTEROID_TEXTURES = [
  "stone-1.jpg",
  "stone-2.jpg",
  "stone-3.jpg",
  "stone-4.jpg",
  "stone-5.jpg",
  "stone-6.jpg",
  "stone-7.jpg",
  "stone-8.jpg",
  "stone-9.jpg",
  "stone-10.jpg",
  "stone-11.jpg",
  "stone-12.jpg",
  "stone-13.jpg",
  "stone-14.jpeg",
  "stone-15.jpg",
  "stone-16.jpg",
  "stone-17.jpeg",
  "stone-18.jpg",
  "stone-19.jpg",
  "stone-20.jpeg",
  "stone-21.jpeg",
];

export const getTextureUrls = async (): Promise<string[]> => {
  return ASTEROID_TEXTURES.map(
    (filename) => `/media/asteroid/textures/${filename}`,
  );
};
