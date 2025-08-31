"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const slides = [
  "Slide 1",
  "Slide 2",
  "Slide 3",
  "Slide 4",
  "Slide 5",
  "Slide 6",
  "Slide 7",
  "Slide 8",
  "Slide 9",
];

export default function PcSwiper() {
  return (
    <div className="h-full 2xl:w-[1440px] md:w-[768px] lg:w-[1024px] bg-black">
      <Swiper
        modules={[Pagination]}
        slidesPerView={1}
        spaceBetween={10}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 50,
          },
          1535: {
            slidesPerView: 4,
            spaceBetween: 50,
          },
        }}
        className="h-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide
            key={index}
            className="flex justify-center items-center text-white text-lg bg-gray-700"
          >
            {slide}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
