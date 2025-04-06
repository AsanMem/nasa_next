"use client";

import { usePathname } from "next/navigation";
import Header from "./ui/header/Header";

export default function ClientLayout({ children }: { children: React.ReactNode }) {

    const pathname = usePathname();



    const isHomePage = pathname === "/";


    return (
        <main className={`p-2 ${isHomePage ? 'bg-black' : ''} min-h-[100vh]`}>
            <Header />
            {children}
        </main>
    );
}

