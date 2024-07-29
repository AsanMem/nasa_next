import type { Metadata } from "next";
import { Bungee } from "next/font/google";
import "./globals.css";
import Header from "@/app/ui/header/Header";
import ClientLayout from "./ClientLayout";

const bungee = Bungee({
  weight: '400',
  adjustFontFallback: true,
  subsets: ['latin', 'latin-ext', 'vietnamese'],
});




export const metadata: Metadata = {
  title: "Nassa Galerey",
  description: "Nassa , UFO , Austronaut",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/media/favicon.ico" />
      </head>
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
