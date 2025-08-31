import Image from "next/image";
import PcSwiper from "@/components/swiperpc";
export default function Home() {
  return (
    <div className="w-full px-6 md-px-3 justify-center flex">
      <div className="w-[400px] 2xl:w-[1440px] md:w-[768px] lg:w-[1024px]">
        <h2 className="text-xl pt-[140px] md:pt-[46px] mb-8">Готовые сборки</h2>
        <PcSwiper />
      </div>
    </div>
  );
}
