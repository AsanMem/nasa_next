import type { Metadata } from "next";
import { Bungee } from "next/font/google";
import "./globals.css";
import Header from "@/app/ui/header/Header";

const bungee = Bungee({
  weight: '400',
  adjustFontFallback: true,
  subsets: ['latin', 'latin-ext', 'vietnamese'],
});

export const metadata: Metadata = {
  title: "Nassa Galerey",
  description: "Nassa , UFO , Austronaut",

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/media/favicon.ico" />
      <body className={`${bungee.className}`}>
        <Header />
        <main className={`p-4`}>
          <video
            className="fixed w-full left-1/2 top-1/2 h-full object-cover transform -translate-x-1/2 -translate-y-1/2 z-0"
            autoPlay
            loop
            muted
            playsInline
            style={{ "zIndex": -1 }}
          >
            <source src="/media/videos/planet_earth.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {children}
        </main>
      </body>
    </html>
  );
}
