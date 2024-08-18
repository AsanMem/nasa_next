"use client";

import { usePathname } from "next/navigation";
import BackgroundVideo from "./ui/shared/background-video";

import { useEffect, useState } from "react";
import Header from "./ui/header/Header";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [isHydrated, setIsHydrated] = useState(false);

    const pathname = usePathname();
    const showImagePaths = ["/day", "/"];
    const showImagePattern = /^\/asteroids\/\d+\/\d+(\.\d+)?(-\d+(\.\d+)?)$/;


    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const shouldShowImage = showImagePaths.includes(pathname) || showImagePattern.test(pathname);
    const isHomePage = pathname === "/";


    return (
        <main className={`p-2 ${isHomePage ? 'bg-black' : ''} min-h-[100vh]`}>
            <Header />
            {isHydrated && !shouldShowImage && <BackgroundVideo />}
            {children}
        </main>
    );
}

