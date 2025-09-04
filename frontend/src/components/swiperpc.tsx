"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import PCCard from "./PCCard";
import { useState, useEffect } from "react";

const pcConfigs = [
  {
    title: "LUMEN",
    price: "340 200 ₽",
    videoCard: "Palit GeForce RTX 5090",
    processor: "AMD Ryzen 9 9950X3D",
    motherboard: "ASUS ROG CROSSHAIR HERO",
    image: "/images/pc1.png",
    backgroundcircle: "#987C41",
  },
  {
    title: "GAMING PRO",
    price: "285 600 ₽",
    videoCard: "NVIDIA GeForce RTX 4080",
    processor: "Intel Core i7-13700K",
    motherboard: "MSI MAG B650 TOMAHAWK",
    image: "/images/pc1.png",
    backgroundcircle: "#5C70C2",
  },
  {
    title: "ULTRA BEAST",
    price: "420 800 ₽",
    videoCard: "NVIDIA GeForce RTX 4090",
    processor: "AMD Ryzen 9 7950X3D",
    motherboard: "ASUS ROG STRIX X670E-E",
    image: "/images/pc1.png",
    backgroundcircle: "#2DE839",
  },
  {
    title: "BUDGET POWER",
    price: "155 900 ₽",
    videoCard: "NVIDIA GeForce RTX 4060",
    processor: "AMD Ryzen 5 7600X",
    motherboard: "ASRock B650M PRO RS",
    image: "/images/pc1.png",
    backgroundcircle: "#5C70C2",
  },
  {
    title: "WORKSTATION",
    price: "380 500 ₽",
    videoCard: "NVIDIA GeForce RTX 4080",
    processor: "Intel Core i9-13900K",
    motherboard: "ASUS PRIME Z790-P",
    image: "/images/pc1.png",
    backgroundcircle: "#2DE839",
  },
];

export default function PcSwiper() {
  const [randomOffset, setRandomOffset] = useState(0);

  useEffect(() => {
    // Генерируем случайное число только на клиенте
    setRandomOffset(Math.floor(Math.random() * 4));
  }, []);

  return (
    <div className="h-[685px] w-full 2xl:w-[1440px] md:w-[768px] max-w-[1440px] lg:w-[1024px] bg-black">
      <Swiper
        modules={[Pagination]}
        slidesPerView={1}
        spaceBetween={10}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          1535: {
            slidesPerView: 4,
            spaceBetween: 24,
          },
        }}
        className="h-full"
      >
        {pcConfigs.map((pc, index) => (
          <SwiperSlide key={index} className="flex justify-center items-center">
            <PCCard
              title={pc.title}
              price={pc.price}
              videoCard={pc.videoCard}
              processor={pc.processor}
              motherboard={pc.motherboard}
              image={pc.image}
              index={index + randomOffset}
              backgroundcircle={pc.backgroundcircle}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
