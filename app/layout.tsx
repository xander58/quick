import type { Metadata } from "next";
import "./globals.css";

// Системный стек шрифтов вместо next/font/google — билд не зависит от сети,
// и для кириллицы системные шрифты (San Francisco/Segoe UI/Roboto) выглядят
// не хуже. Если позже захочется брендовый шрифт — можно самостоятельно
// подключить .woff2 файлы через next/font/local, это тоже без сетевого фетча.

export const metadata: Metadata = {
  title: "Quick — тренажёр печати",
  description: "Онлайн тренажер быстрой печати",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
