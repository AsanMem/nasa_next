import type { Metadata } from "next";
import { Bungee, Space_Grotesk } from "next/font/google";
import "./globals.css";
import type { Viewport } from 'next'


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
  title: "SPACE TRAVEL",
  description: "NASA , UFO , Astronaut , Astronauts , NASA Gallery",
  manifest: "/manifest.json",
  icons: {
    icon: '/media/favicon.ico',
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
    <html lang="en">
      <body className={`${bungee.variable} ${spaceGrotesk.variable} w-full h-full min-h-[100vh]`}>
        {children}
      </body>
    </html >
  );
}
