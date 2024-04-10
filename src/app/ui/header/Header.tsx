


'use client';


import Image from "next/image";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import styles from "./Header.module.css"

const links = [
    { name: 'Gallery', href: '/gallery', icon: "" },
    { name: 'Photo of the day', href: '/day', icon: "", },
    { name: 'Videos', href: '/video', icon: "" },
    { name: 'About', href: '/publics', icon: "" },
    { name: 'Asteroids', href: '/asteroids', icon: "" },
];

export default function Header() {
    const pathname = usePathname();
    return (
        <header>      
           <nav className="p-2 px-4 rounded-md shadow flex flex-col md:flex-row justify-between items-center">
    <div className="mb-2 md:mb-0">
        <Link
            key={"Home gallery"}
            href={"/"}
            aria-current="page"
            className="inline-block"
        >
            <Image
                src="/media/logo/NASA_logo.png"
                width={120}
                height={90}
                className=""
                alt="Screenshots of the dashboard project showing desktop version"
            />
        </Link>
    </div>
<ul className="list-none p-0 flex flex-col md:flex-row md:flex-wrap">
    {/* <ul className="list-none mr-2 p-0 flex flex-wrap md:flex-nowrap"> */}
  {links.map((link) => (
    <li className="inline-block mb-2 md:mb-0" key={link.name}>
      <Link href={link.href} className={`relative ${styles.navLink} pl-4`}>
        <p className="text-sm sm:text-base md:text-base lg:text-lg xl:text-xl">{link.name}</p>
        {/* {pathname === link.href && (
          <span className="absolute block w-3 h-3 bg-red-600 left-1/2 transform -translate-x-2.5 -translate-y-1/2 rotate-45 opacity-0 transition duration-300 hover:opacity-100 top-0"></span>
        )} */}
      </Link>
    </li>
  ))}
</ul>
</nav>
        </header>
    );
}

