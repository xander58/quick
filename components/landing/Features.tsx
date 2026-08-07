import { StatsIcon, ShuffleIcon, SlidersIcon } from "./FeatureIcons";

const FEATURES = [
  {
    icon: StatsIcon,
    title: "Улучшайте результаты",
    text: "Сервис сам посчитает количество ошибок и скорость набора. Вам не нужно об этом думать.",
  },
  {
    icon: ShuffleIcon,
    title: "Выбирайте задания, которые не надоедают",
    text: "Выбирайте сами, какой текст набирать: простые слова или отрывки из классических произведений.",
  },
  {
    icon: SlidersIcon,
    title: "Настройте под себя",
    text: "Увеличивайте шрифт, включите тёмную тему, печатайте со звуком настоящей клавиатуры или без него.",
  },
];

export default function Features() {
  return (
    <section className="bg-surface">
      <div className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-3 gap-10">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title}>
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
              <Icon />
            </div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-muted text-sm mt-2 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
