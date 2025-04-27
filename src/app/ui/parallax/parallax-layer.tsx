"use client";
import { useEffect } from "react";
import gsap from "gsap";
import styles from "./parallax-layer.module.css";

export default function ParallaxLayer() {
    useEffect(() => {
        gsap.to(`.${styles.stars}`, {
            y: "100%",
            repeat: -1,
            duration: 60,
            ease: "linear",
        });
        // gsap.to(`.${styles.asteroids}`, {
        //     y: "50%",
        //     repeat: -1,
        //     duration: 120,
        //     ease: "linear",
        // });
        // gsap.to(`.${styles.galaxies}`, {
        //     y: "30%",
        //     repeat: -1,
        //     duration: 180,
        //     ease: "linear",
        // });
    }, []);

    return (
        <div className="relative w-full h-screen overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
                <div className={`${styles.layer} ${styles.stars}`}></div>
                {/* <div className={`${styles.layer} ${styles.asteroids}`}></div>
                <div className={`${styles.layer} ${styles.galaxies}`}></div> */}
            </div>
        </div>
    );
}
