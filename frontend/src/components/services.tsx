"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { usePathname } from "next/navigation";
import "swiper/css";
import "swiper/css/pagination";

const servicesData = [
  {
    id: 1,
    title: "Сборка ПК",
    description:
      "Профессиональная сборка компьютера из выбранных комплектующих с гарантией качества",
    image: "/images/swiper3/sv1.svg",
    price: "от 2 800 ₽",
  },
  {
    id: 2,
    title: "Апгрейд",
    description:
      "Модернизация существующего ПК новыми комплектующими для повышения производительности",
    image: "/images/swiper3/sv2.svg",
    price: "от 1 500 ₽",
  },
  {
    id: 3,
    title: "Диагностика",
    description:
      "Полная диагностика системы для выявления неисправностей и проблем в работе",
    image: "/images/swiper3/sv3.svg",
    price: "от 800 ₽",
  },
  {
    id: 4,
    title: "Чистка ПК",
    description:
      "Профессиональная чистка от пыли, замена термопасты и профилактическое обслуживание",
    image: "/images/swiper3/sv4.svg",
    price: "от 1 200 ₽",
  },
  {
    id: 5,
    title: "Настройка",
    description:
      "Установка операционной системы, драйверов и необходимого программного обеспечения",
    image: "/images/swiper3/sv5.svg",
    price: "от 1 000 ₽",
  },
];

export default function Services() {
  return (
    <div className="w-full">
      {/* Свайпер для мобильных и планшетов */}
      <div className="lg:hidden">
        <Swiper
          modules={[Pagination]}
          slidesPerView="auto"
          spaceBetween={24}
          className="services-swiper pb-12"
        >
          {servicesData.map((service) => (
            <SwiperSlide key={service.id} className="!w-[300px] sm:!w-[340px]">
              <div className="bg-[#1a1a1a] rounded-2xl p-6 h-[280px] flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br bg-[#2c2c2c] rounded-xl flex items-center justify-center flex-shrink-0">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-6 h-6"
                    />
                  </div>
                  <h3 className="text-white text-lg font-medium">
                    {service.title}
                  </h3>
                </div>

                <p className="text-gray-300 text-sm mb-4 flex-1">
                  {service.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-[#7951F4] font-medium">
                    {service.price}
                  </span>
                  <button className="px-4 py-2 bg-[#2a2a2a] text-gray-300 rounded-xl hover:bg-[#7951F4] hover:text-white transition-all duration-200 text-sm">
                    Заказать
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Сетка для десктопов */}
      <div className="hidden lg:grid lg:grid-cols-3 2xl:grid-cols-5 gap-6">
        {servicesData.map((service) => (
          <div
            key={service.id}
            className="bg-[#1a1a1a] rounded-2xl p-6 h-[280px] flex flex-col"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-[#2c2c2c] rounded-xl flex items-center justify-center flex-shrink-0">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-6 h-6"
                />
              </div>
              <h3 className="text-white text-lg font-medium">
                {service.title}
              </h3>
            </div>

            <p className="text-gray-300 text-sm mb-4 flex-1">
              {service.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-[#7951F4] font-medium">
                {service.price}
              </span>
              <button className="px-4 py-2 bg-[#2a2a2a] text-gray-300 rounded-xl hover:bg-[#7951F4] hover:text-white transition-all duration-200 text-sm">
                Заказать
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
