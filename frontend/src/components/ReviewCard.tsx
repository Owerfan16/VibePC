"use client";
import { usePathname } from "next/navigation";
interface ReviewCardProps {
  name: string;
  rating: number;
  text: string;
  date: string;
}

export default function ReviewCard({
  name,
  rating,
  text,
  date,
}: ReviewCardProps) {
  const pathname = usePathname();

  // Определяем цвет в зависимости от страницы
  const getIconColor = () => {
    switch (pathname) {
      case "/config":
        return "#3F99D0"; // Конфигуратор - голубой
      case "/services":
        return "#1DE9B6"; // Услуги - зеленый
      case "/":
        return "#755CC2"; // Готовые ПК - синий
      default:
        return "#755CC2"; // Дефолтный фиолетовый
    }
  };

  const iconColor = getIconColor();
  return (
    <div className="w-[260px] xs:w-[280px] sm:w-[320px] md:w-[340px] lg:w-[310px] 2xl:w-[360px] h-[220px] rounded-[15px] bg-gradient-to-b from-[#1a1a1a]/[2%] via-[#2a1a3a]/[5%] to-[#0f0f0f]/[8%] backdrop-blur-[12px] border border-white/[10.2%] shadow-inner shadow-white/5% p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={i < rating ? "text-yellow-400" : "text-gray-600"}
              >
                <path
                  d="M8 0L10.472 5.528L16 6.112L12 10.112L12.944 16L8 13.472L3.056 16L4 10.112L0 6.112L5.528 5.528L8 0Z"
                  fill={i < rating ? iconColor : "#4B5563"}
                />
              </svg>
            ))}
          </div>
          <span className="text-gray-400 text-sm">{date}</span>
        </div>
        <p className="text-white text-sm leading-relaxed line-clamp-4">
          {text}
        </p>
      </div>
      <div className="font-medium text-sm" style={{ color: iconColor }}>
        {name}
      </div>
    </div>
  );
}
