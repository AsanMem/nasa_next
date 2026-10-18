import type { Metadata } from "next";
import { Bungee, Space_Grotesk } from "next/font/google";
import "./globals.css";
import OrbitalSceneProvider from "./ui/orbital/scene-provider";
import type { Viewport } from 'next'
import { pageMetadata,site } from "./lib/site";


const bungee = Bungee({
  weight: '400',
  adjustFontFallback: true,
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  variable: '--font-bungee'
});

const spaceGrotesk = Space_Grotesk({
  weight: ['400', '500', '600'],
  adjustFontFallback: true,
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  ...pageMetadata("/","Orbital | Explore Earth and beyond","Explore NASA observations, asteroid encounters, Earth imagery and space birthday posters."),
  manifest: "/manifest.json",
  icons: {
    icon: '/orbital-icon.svg',
  }
};

export function generateViewport(): Viewport {
  return {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-black">
      <body className={`${bungee.variable} ${spaceGrotesk.variable} w-full min-h-[100svh] bg-black`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"WebSite",name:site.name,url:site.origin,inLanguage:"en",creator:{"@type":"Person",name:site.author}}).replace(/</g,"\\u003c")}}/>
        <OrbitalSceneProvider>{children}</OrbitalSceneProvider>
      </body>
    </html >
  );
}
