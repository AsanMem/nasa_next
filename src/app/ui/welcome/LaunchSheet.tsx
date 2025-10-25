import Link from "next/link";
import { useEffect } from "react";

export function LaunchSheet({ show, onClose }: { show: boolean; onClose: () => void }) {

    useEffect(() => {
        if (!show) return;
        const t = setTimeout(onClose, 1800);
        const onScroll = () => onClose();
        window.addEventListener('scroll', onScroll, { once: true, passive: true });
        return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll); };
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-40 p-4">
            <div className="mx-auto max-w-3xl rounded-2xl border border-white/15 bg-black/70 backdrop-blur shadow-2xl">
                <div className="p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-300/80">Welcome aboard</p>
                    <h2 className="mt-2 text-xl font-semibold">Choose your destination</h2>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <Link href="/asteroids" className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10">Asteroids</Link>
                        <Link href="/gallery" className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10">Gallery</Link>
                        <Link href="/video" className="rounded-full border border-white/20 px-4 py-2 text-sm hover:bg-white/10">Missions</Link>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                        <a href="#discover" className="uppercase tracking-[0.25em] hover:text-white">↓ Scroll</a>
                        <button onClick={onClose} className="uppercase tracking-[0.25em] hover:text-white">Skip</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
