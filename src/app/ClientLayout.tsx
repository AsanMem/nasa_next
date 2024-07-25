"use client";

import Script from 'next/script';
import BackgroundVideo from "./ui/shared/background-video";
import { useEffect, useState } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    return (
        <main className={`p-4`}>
            {isHydrated && <BackgroundVideo />}
            {children}
            {/* <Script
                src="/scripts/main-tree.js"
                type="module" // Обязательно укажите тип модуля
                strategy="lazyOnload"
            />
            {isHydrated && <Script src="/scripts/main-tree.js" strategy="lazyOnload" />} */}
        </main>
    );
}
