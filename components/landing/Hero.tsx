import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-bg">
      <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 items-center">
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Быстро печатать
            <br />
            <span className="text-accent">Проще, чем вы думаете!</span>
          </h1>
          <p className="text-muted mt-5 max-w-md text-lg">
            Тренируйте быстрый набор текста бесплатно и без регистрации в
            удобном приложении. Жмите кнопку ниже, чтобы попробовать!
          </p>
          <Link
            href="/trainer"
            className="inline-flex items-center gap-2 mt-8 bg-surface border border-muted/20 rounded-full px-6 py-3 font-medium shadow-sm hover:shadow-md hover:border-muted/30 transition-shadow"
          >
            Запустить
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="relative">
          <Image
            src="/screenshot.png"
            alt="Интерфейс тренажёра Quick — печать цитаты с таймером и клавиатурой"
            width={1522}
            height={932}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </section>
  );
}
