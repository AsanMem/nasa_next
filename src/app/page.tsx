import type { Metadata } from "next";
import HomeConsole from "./ui/mission-console/home-console";

export const metadata: Metadata = {
  title: "Orbital | Explore Earth and beyond",
  description: "Explore our universe through NASA's observations, images and discoveries. Start with near-Earth objects, our changing planet, or the image of the day.",
};

export default function MainPage() {
  return <HomeConsole />;
}
