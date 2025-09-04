"use client";
import Image from "next/image";
import { useMemo } from "react";

interface PCCardProps {
  title: string;
  price: string;
  videoCard: string;
  processor: string;
  motherboard: string;
  image: string;
  index: number;
  backgroundcircle: string;
}

export default function PCCard({
  title,
  price,
  videoCard,
  processor,
  motherboard,
  image,
  index,
  backgroundcircle,
}: PCCardProps) {
  const gradients = [
    "/images/grad1.svg",
    "/images/grad2.svg",
    "/images/grad3.svg",
    "/images/grad4.svg",
  ];

  const selectedGradient = useMemo(() => {
    // Детерминированный выбор на основе индекса для избежания ошибок гидратации
    const gradientIndex = index % gradients.length;
    return gradients[gradientIndex];
  }, [index]);
  return (
    <div className="h-[685px] relative w-[320px] md:w-[364px] lg:w-[328px] 2xl:w-[342px] overflow-hidden">
      <img
        src={selectedGradient}
        alt={title}
        className="absolute inset-0 top-50"
      />
      <svg
        width="173"
        height="115"
        viewBox="0 0 173 115"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-[95px] left-[72px] filter blur-[80px]"
      >
        <ellipse
          cx="86.5"
          cy="57.5"
          rx="86.5"
          ry="57.5"
          fill={backgroundcircle}
        />
      </svg>
      <div className="2xl:w-[342px] lg:w-[328px] md:w-[364px] w-[320px] md:mx-0 h-[685px] bg-[linear-gradient(rgba(112,0,248,0.03),rgba(112,0,248,0.1))] backdrop-blur-[35px] [box-shadow:inset_0_0_4px_0_rgba(255,255,255,0.05)] rounded-[24px] p-6 flex flex-col relative overflow-hidden">
        <div className="relative z-10 flex flex-col h-full">
          {/* Изображение ПК */}
          <div className="flex-1 flex items-center justify-center mb-4">
            <div className="relative w-full h-[240px]">
              <Image src={image} alt={title} fill className="object-contain" />
            </div>
          </div>

          {/* Название */}
          <h3 className="text-white text-2xl font-medium text-center mb-6">
            {title}
          </h3>

          {/* Характеристики */}
          <div className="space-y-4 mb-4">
            {/* Видеокарта */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 mt-1">
                <Image
                  src="/images/videocard.svg"
                  alt="Видеокарта"
                  width={24}
                  height={24}
                  className="opacity-80"
                />
              </div>
              <div>
                <p className="text-[#80BDBF] text-sm">Видеокарта</p>
                <p className="text-white text-sm font-medium">{videoCard}</p>
              </div>
            </div>

            {/* Процессор */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 mt-1">
                <Image
                  src="/images/cpu.svg"
                  alt="Процессор"
                  width={24}
                  height={24}
                  className="opacity-80"
                />
              </div>
              <div>
                <p className="text-[#80BDBF] text-sm">Процессор</p>
                <p className="text-white text-sm font-medium">{processor}</p>
              </div>
            </div>

            {/* Материнская плата */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 mt-1">
                <Image
                  src="/images/motherboard.svg"
                  alt="Материнская плата"
                  width={24}
                  height={24}
                  className="opacity-80"
                />
              </div>
              <div>
                <p className="text-[#80BDBF] text-sm">Материнская плата</p>
                <p className="text-white text-sm font-medium">{motherboard}</p>
              </div>
            </div>
          </div>

          {/* Ссылка на полную спецификацию */}
          <p className="text-[#9A7FED] text-sm cursor-pointer mb-6 hover:text-white transition-colors">
            Показать всю спецификацию
          </p>

          {/* Цена */}
          <p className="text-white text-xl text-center mb-6">{price}</p>

          {/* Кнопка */}
          <button
            className="w-full h-[42px] mx-auto  bg-gradient-to-br from-[#800094] to-[#34008d] rounded-2xl text-[#CBD1D3] text-xl hover:from-[#4800C1] hover:to-[#A800C2] transition-all duration-200   shadow-[inset_0_0_4px_rgba(0,0,0,0.25)] 
         backdrop-blur-[100px] transform hover:scale-[1.02]"
          >
            Купить
          </button>
        </div>
      </div>
    </div>
  );
}
