// Звук клавиш через Web Audio API — при быстрой печати несколько нот должны
// звучать внахлёст, а Web Audio из коробки поддерживает параллельные
// проигрывания одного буфера через отдельные BufferSourceNode.
//
// Источник звука — запись линейного свитча Alpaca (репозиторий kbsim,
// MIT license). Alpaca выбран специально как один из самых гладких и тихих
// линейных свитчей — без щелчка, с мягким глубоким "thock". Подробности —
// в /public/sounds/SOURCE.txt и LICENSE-ALPACA.txt.

const SOUND_URLS = [
  "/sounds/alpaca/press0.mp3",
  "/sounds/alpaca/press1.mp3",
  "/sounds/alpaca/press2.mp3",
  "/sounds/alpaca/press3.mp3",
  "/sounds/alpaca/press4.mp3",
];

let audioContext: AudioContext | null = null;
let buffersPromise: Promise<AudioBuffer[]> | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    audioContext = new Ctx();
  }
  return audioContext;
}

function loadBuffers(): Promise<AudioBuffer[]> | null {
  const ctx = getContext();
  if (!ctx) return null;
  if (!buffersPromise) {
    buffersPromise = Promise.all(
      SOUND_URLS.map((url) =>
        fetch(url)
          .then((res) => res.arrayBuffer())
          .then((data) => ctx.decodeAudioData(data))
      )
    );
  }
  return buffersPromise;
}

/**
 * Прогреваем загрузку звуков заранее (при монтировании компонента),
 * чтобы самое первое нажатие клавиши не звучало с задержкой на сеть.
 */
export function preloadKeySound() {
  loadBuffers()?.catch(() => {
    // тихо игнорируем — если звук не загрузился, печать просто идёт без звука
  });
}

/**
 * Alpaca — линейный свитч, от природы гладкий и тихий (без щелчка), поэтому
 * агрессивная фильтрация здесь не нужна — только лёгкий lowpass, чтобы
 * сгладить цифровые артефакты сжатия mp3.
 *
 * Сами файлы нормализованы по пику до −1 дБ (см. scripts/normalize_sounds.sh) —
 * исходные записи были очень тихими (пик около −20 дБ), из-за чего звук
 * был почти не слышен даже на приличной громкости устройства. Регулировки
 * громкости внутри приложения нет — по тестам зафиксированный уровень
 * оказался комфортным сам по себе.
 */
export function playKeySound(volume = 0.5) {
  const ctx = getContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  loadBuffers()
    ?.then((buffers) => {
      const buffer = buffers[Math.floor(Math.random() * buffers.length)];

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      // небольшая случайная вариация высоты тона поверх и так разных
      // сэмплов — печать звучит ещё живее
      source.playbackRate.value = 0.97 + Math.random() * 0.06;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 7500; // лёгкое сглаживание, не обрезаем характер звука

      const gain = ctx.createGain();
      // 0.9 — потолок, чтобы даже на максимуме слайдера не было клиппинга
      gain.gain.value = Math.max(0, Math.min(1, volume)) * 0.9;

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
    })
    .catch(() => {});
}

const IGNORED_KEYS = new Set([
  "Shift",
  "Control",
  "Alt",
  "Meta",
  "CapsLock",
  "Tab",
  "Escape",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "F1", "F2", "F3", "F4", "F5", "F6",
  "F7", "F8", "F9", "F10", "F11", "F12",
]);

/**
 * Звук не нужен на "немых" служебных клавишах (Shift, стрелки и т.д.) —
 * только на тех, что реально что-то печатают или стирают.
 */
export function shouldPlayForKey(key: string): boolean {
  return !IGNORED_KEYS.has(key);
}
