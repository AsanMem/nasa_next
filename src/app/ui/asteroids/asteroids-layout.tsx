
"use client";

import { useEffect, useState, ReactNode } from "react";
import clsx from "clsx";

export default function AsteroidsLayout({ children }: { children: ReactNode }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 3000);
        return () => clearTimeout(t);
    }, []);

    return (
        <>
            <div
                className={clsx(
                    "pointer-events-none fixed inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/90 transition-opacity duration-1000",
                    visible ? "opacity-100" : "opacity-0"
                )}
            />
            <div
                className={clsx(
                    "relative z-10 mx-auto max-w-7xl px-6 py-16 transition-all duration-1000",
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
            >
                {children}
            </div>
        </>
    );
}
