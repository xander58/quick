import Link from "next/link";

export default function BottomCta() {
  return (
    <section className="bg-bg border-t border-muted/10">
      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Готовы начать тренировку?
          </h2>
          <p className="text-muted mt-2 max-w-lg">
            Запустите тренажёр и просто начните печатать: таймер запустится
            автоматически. Как только закончится время, появится ваш результат.
          </p>
        </div>
        <Link
          href="/trainer"
          className="inline-flex items-center gap-2 shrink-0 bg-accent text-white rounded-full px-6 py-3 font-medium hover:bg-accent-hover transition-colors"
        >
          Начать бесплатно!
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
