'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { name: "Gallery", href: "/gallery" },
  { name: "Media of the day", href: "/day" },
  { name: "Videos", href: "/video" },
  { name: "Asteroids", href: "/asteroids" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40">
      <nav
        className={clsx(
          "w-full border-b border-white/10 bg-black/5 backdrop-blur-md",
          "px-4 py-2 sm:px-6 flex items-center justify-between"
        )}
      >
        <Link
          href="/library"
          className="shrink-0"
          aria-label="Go to NASA Library"
        >
          <Image
            src="/media/logo/NASA_logo.png"
            width={100}
            height={60}
            alt="NASA logo"
            className="w-[70px] sm:w-[90px] h-auto"
          />
        </Link>

        <ul
          className={clsx(
            "flex flex-col items-end gap-1",
            "sm:flex-row sm:flex-nowrap sm:items-center sm:gap-4"
          )}
        >
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <li
                key={link.name}
                className={clsx(
                  "flex justify-end",
                  "sm:justify-start"
                )}
              >
                <Link
                  href={link.href}
                  className={clsx(
                    "group relative inline-block",
                    "px-1.5 py-0.5 sm:px-3 sm:py-1",
                    "text-[9px] sm:text-[11px] md:text-xs lg:text-sm",
                    "uppercase",
                    "tracking-[0.14em] sm:tracking-[0.18em]",
                    "transition-colors duration-200",
                    isActive ? "text-white" : "text-white/60 hover:text-white"
                  )}
                >

                  <span
                    className={clsx(
                      "pointer-events-none absolute -top-1 left-1/2 h-[6px] w-[6px]",
                      "-translate-x-1/2 rotate-45 bg-[#ff3a2f]",
                      "opacity-0 transition-opacity duration-200",
                      "group-hover:opacity-100",
                      "sm:h-[7px] sm:w-[7px]"
                    )}
                  />

                  <span>{link.name}</span>

                  {isActive && (
                    <span
                      className={clsx(
                        "pointer-events-none absolute left-[18%] bottom-0 h-[2px] w-[64%]",
                        "rounded-full bg-[#ff3a2f] shadow-[0_0_6px_#ff3a2f]",
                        "sm:left-[15%] sm:w-[70%]"
                      )}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
