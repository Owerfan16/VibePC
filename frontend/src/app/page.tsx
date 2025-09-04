import Image from "next/image";
import PcSwiper from "@/components/swiperpc";
import HowWeWork from "@/components/howwework";
import Reviews from "@/components/reviews";

export default function Home() {
  return (
    <div className="w-full px-6 md-px-3 page-container">
      <div className="max-w-[400px] 2xl:max-w-[1440px] md:max-w-[768px] lg:max-w-[1024px]">
        <h2 className="text-xl pt-[140px] md:pt-[46px] mb-8">Готовые сборки</h2>
        <PcSwiper />
        <div className="relative">
          <HowWeWork />
          <Reviews />
        </div>
      </div>
    </div>
  );
}
