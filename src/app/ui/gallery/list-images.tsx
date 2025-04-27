'use client'
import Image from 'next/image';
import CardImage from './card-image';

import { fetchFilteredImages } from '@/app/lib/data/fetchFilteredImages';
import Pagination from '../shared/pagination';
import CardTopic from './card-topic';
import gsap from 'gsap';

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from 'react';
gsap.registerPlugin(ScrollTrigger);


interface ListImagesProps {
  gallery: any[];
  totalPages: number;
}

export default function ListImages({ gallery, totalPages }: ListImagesProps) {


  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = gsap.utils.toArray<HTMLDivElement>(".cardTopic");

    cards.forEach((card) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            end: "top 30%",
            scrub: false,
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    // Чистим ScrollTrigger при размонтировании
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);



  if (!gallery || gallery.length === 0) {
    return (
      <div className="mt-35 flex flex-wrap content-around justify-evenly items-stretch">
        <div className="text-2xl text-slate-300 flex items-center justify-between pb-4 my-8">
          'This is not found :('
        </div>
      </div>
    );
  }



  return (
    <>
      {gallery && gallery.length > 0 ? (
        <div ref={cardsRef} className={"mt-35 flex flex-wrap content-around justify-evenly items-stretch"}>
          {gallery.map((img: any, i: number) => (
            <CardTopic topic={img} key={img.data[0].title + i}

            />
          ))}
          <div className="mt-5 flex w-full justify-center">
            <Pagination totalPages={totalPages} />
          </div>
        </div>
      ) : (
        <div className={"mt-35 flex flex-wrap content-around justify-evenly items-stretch"}>
          <div className="text-2xl text-slate-300 flex items-center justify-between pb-4 my-8">
            'This is not found :('
          </div>
        </div>
      )}
    </>
  );
}