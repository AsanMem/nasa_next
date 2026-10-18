import { pageMetadata } from "@/app/lib/site";
import HomeConsole from "./ui/mission-console/home-console";

export const metadata=pageMetadata("/","Orbital | Explore Earth and beyond","Explore NASA observations, asteroid encounters, Earth imagery and space birthday posters.");

export default function MainPage() {
  return <HomeConsole />;
}
