"use client";

import { usePathname } from "next/navigation";
import BackgroundVideo from "./ui/shared/background-video";
import BackgroundImage from "./ui/shared/background-image";
import { useEffect, useState } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [isHydrated, setIsHydrated] = useState(false);

    const pathname = usePathname();
    const showImagePaths = ["/day"];
    const showImagePattern = /^\/asteroids\/\d+\/\d+(\.\d+)?(-\d+(\.\d+)?)$/;


    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const shouldShowImage = showImagePaths.includes(pathname) || showImagePattern.test(pathname);

    return (
        <main className={`p-4`}>
            {isHydrated && !shouldShowImage && <BackgroundVideo />}
            {children}
        </main>
    );
}

