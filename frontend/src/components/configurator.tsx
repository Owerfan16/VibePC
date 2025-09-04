"use client";
import { usePathname } from "next/navigation";

const components = [
  { id: "cpu", name: "Процессор", icon: "/images/configurator/cpu.svg" },
  {
    id: "motherboard",
    name: "Материнская плата",
    icon: "/images/configurator/motherboard.svg",
  },
  {
    id: "videocard",
    name: "Видеокарта",
    icon: "/images/configurator/videocard.svg",
  },
  {
    id: "memory",
    name: "Оперативная память",
    icon: "/images/configurator/memory.svg",
  },
  { id: "power", name: "Блок питания", icon: "/images/configurator/power.svg" },
  { id: "case", name: "Корпус", icon: "/images/configurator/case.svg" },
  {
    id: "harddisk",
    name: "Накопители",
    icon: "/images/configurator/harddisk.svg",
  },
  {
    id: "cooler",
    name: "Охлаждение процессора",
    icon: "/images/configurator/cooler.svg",
  },
  { id: "mouse", name: "Перифирия", icon: "/images/configurator/mouse.svg" },
];

export default function Configurator() {
  const pathname = usePathname();

  // Определяем цвет для hover эффектов
  const getHoverColor = () => {
    switch (pathname) {
      case "/config":
        return "#3F99D0"; // Конфигуратор - голубой
      case "/services":
        return "#1DE9B6"; // Услуги - зеленый
      case "/":
        return "#007aff"; // Готовые ПК - синий
      default:
        return "#7951F4"; // Дефолтный фиолетовый
    }
  };

  // Определяем градиент для кнопки "Купить"
  const getButtonGradient = () => {
    switch (pathname) {
      case "/config":
        return "from-[#3F99D0] to-[#2E7BA0]"; // Конфигуратор - голубой градиент
      case "/services":
        return "from-[#1DE9B6] to-[#16C2A0]"; // Услуги - зеленый градиент
      case "/":
        return "from-[#007aff] to-[#005bb5]"; // Готовые ПК - синий градиент
      default:
        return "from-[#7951F4] to-[#5A3FBF]"; // Дефолтный фиолетовый
    }
  };

  const hoverColor = getHoverColor();
  const buttonGradient = getButtonGradient();

  return (
    <div className="w-full">
      <div className="max-w-[400px] 2xl:max-w-[1440px] md:max-w-[768px] lg:max-w-[1024px]">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Левая колонка - Компоненты */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {components.map((component) => (
                <div
                  key={component.id}
                  className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-2xl border border-[#1a1a1a] transition-colors"
                  style={
                    {
                      "--hover-border-color": hoverColor,
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = hoverColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#1a1a1a";
                  }}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={component.icon}
                      alt={component.name}
                      className="w-6 h-6 text-[#7951F4]"
                    />
                    <span className="text-white text-base">
                      {component.name}
                    </span>
                  </div>

                  <button
                    className="px-4 py-2 bg-[#2a2a2a] text-gray-300 rounded-xl hover:text-white transition-all duration-200 text-sm"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = hoverColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#2a2a2a";
                    }}
                  >
                    Выбрать
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Правая колонка - Дополнительные опции и итог */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <div className="bg-[#1a1a1a] rounded-2xl p-6 space-y-6">
              {/* Дополнительные опции */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">
                    Активация Windows 11
                  </span>
                  <div className="w-10 h-6 bg-gray-600 rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-gray-400 rounded-full absolute top-1 left-1 transition-transform"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">
                    Установка Microsoft Office 2019
                  </span>
                  <div className="w-10 h-6 bg-gray-600 rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-gray-400 rounded-full absolute top-1 left-1 transition-transform"></div>
                  </div>
                </div>
              </div>

              {/* Разделитель */}
              <hr className="border-gray-600" />

              {/* Итоговые цены */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm">Комплектующие</span>
                  <span className="text-white">134 800 ₽</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white text-sm">Услуга сборки</span>
                  <span className="text-white">2 800 ₽</span>
                </div>

                {/* Разделитель */}
                <hr className="border-gray-600" />

                <div className="flex justify-between items-center">
                  <span className="text-white text-lg">К оплате</span>
                  <span className="text-xl" style={{ color: hoverColor }}>
                    0 ₽
                  </span>
                </div>
              </div>

              {/* Кнопка купить */}
              <button
                className={`w-full py-3 bg-gradient-to-r ${buttonGradient} text-white rounded-xl transition-all duration-200 hover:opacity-90`}
              >
                Купить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
