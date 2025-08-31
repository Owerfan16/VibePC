import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const roboto = Roboto({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "VibePC — Сборка, апгрейд и покупка игровых ПК",
  description:
    "VibePC — онлайн-конфигуратор и готовые сборки компьютеров. Подберём комплектующие, выполним апгрейд, обслужим и настроим ПК.",
  keywords: [
    "сборка пк",
    "конфигуратор пк",
    "готовые сборки",
    "апгрейд компьютера",
    "замена термопасты",
    "услуги для пк",
    "купить пк",
    "купить компьютер",
    "собрать компьютер",
    "VibePC",
    "вайб пк",
    "вайбпк",
    "вайбписи",
    "вайб писи",
    "чистка пк",
    "чистка компьютера",
    "мощный компьютер",
    "игровой компьютер",
  ],
  authors: [{ name: "VibePC Team" }],
  openGraph: {
    title: "VibePC — Конфигуратор и готовые сборки ПК",
    description:
      "Соберите компьютер онлайн, выберите готовую сборку или закажите апгрейд. Услуги по обслуживанию и настройке ПК.",
    url: "https://vibepc.ru",
    siteName: "VibePC",
    locale: "ru_RU",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/images/logo.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${roboto.className} antialiased`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
