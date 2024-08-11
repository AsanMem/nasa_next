import type { Metadata } from "next";
import { Bungee } from "next/font/google";
import "./globals.css";
import Header from "@/app/ui/header/Header";
import ClientLayout from "./ClientLayout";
import type { Viewport } from 'next'

const bungee = Bungee({
  weight: '400',
  adjustFontFallback: true,
  subsets: ['latin', 'latin-ext', 'vietnamese'],
});



export const metadata: Metadata = {
  title: "SPACE TRAVEL",
  description: "Nassa , UFO , Austronaut , Nassa Galerey",
  manifest: "/manifest.json",
  icons: {
    icon: '/media/favicon.ico',
  },

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

      <body className={`${bungee.className}`}>
        <Header />
        <ClientLayout>
          {children}
        </ClientLayout>
        <footer className={`h-6`}></footer>
      </body>
    </html>
  );
}
