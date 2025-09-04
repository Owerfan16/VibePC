"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import ReviewCard from "./ReviewCard";

const reviews = [
  {
    name: "Алексей М.",
    rating: 5,
    text: "Отличная сборка! Все работает стабильно, температура в норме. Менеджеры помогли подобрать оптимальную конфигурацию под мой бюджет.",
    date: "15.12.2024",
  },
  {
    name: "Мария К.",
    rating: 5,
    text: "Быстрая доставка, качественная сборка. ПК работает без нареканий уже полгода. Рекомендую!",
    date: "10.12.2024",
  },
  {
    name: "Дмитрий С.",
    rating: 4,
    text: "Хорошее качество сборки, но доставка была немного дольше заявленного. В целом доволен покупкой.",
    date: "08.12.2024",
  },
];

export default function Reviews() {
  return (
    <div className="w-full mx-auto justify-center flex -mt-[100px] relative z-10">
      <div className="w-full max-w-[400px] 2xl:max-w-[1440px] md:max-w-[768px] lg:max-w-[1024px] rounded-t-4xl bg-[url('/images/reviews.avif')] bg-cover bg-center mt-[48px] h-[460px] reviews-small:h-[500px] md:h-[420px] lg:h-[414px]">
        <h2 className="text-xl pt-[46px] pl-6 md:pl-[36px] md:pt-[46px] mb-8">
          Отзывы
        </h2>

        {/* Swiper для экранов до 1024px */}
        <div className="lg:hidden pl-6">
          <Swiper
            modules={[Pagination]}
            slidesPerView="auto"
            spaceBetween={16}
            className="reviews-swiper"
          >
            {reviews.map((review, index) => (
              <SwiperSlide key={index}>
                <ReviewCard
                  name={review.name}
                  rating={review.rating}
                  text={review.text}
                  date={review.date}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Обычная сетка для экранов 1024px+ */}
        <div className="block 2xl:flex">
          <div className="hidden lg:flex gap-6 px-6 h-full">
            {reviews.map((review, index) => (
              <ReviewCard
                key={index}
                name={review.name}
                rating={review.rating}
                text={review.text}
                date={review.date}
              />
            ))}
          </div>
          <div className="2xl:pl-24 ml-6 2xl:ml-0 mt-6 2xl:mt-0 flex 2xl:block reviews-logos-container">
            <p className="text-xl mb-4 md:mb-0">
              Больше <br className="hidden 2xl:flex" />
              отзывов на <br className="hidden 2xl:flex" />
              картах:
            </p>
            <img
              className="h-[32px] 2xl:mt-4 ml-6 2xl:ml-0"
              src="/images/yandexcardlogo.png"
              alt=""
            />
            <img
              className="h-[32px] 2xl:mt-2 ml-6 2xl:ml-0"
              src="/images/2gislogo.png"
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  );
}
