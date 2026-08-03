export type CharStatus = "pending" | "correct" | "incorrect";

/**
 * Посимвольное сравнение эталонного текста с введённым.
 * Индекс i в результирующем массиве соответствует символу target[i].
 */
export function getCharStatuses(target: string, typed: string): CharStatus[] {
  return target.split("").map((ch, i) => {
    if (i >= typed.length) return "pending";
    return typed[i] === ch ? "correct" : "incorrect";
  });
}

export interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  elapsedSeconds: number;
}

const CHARS_PER_WORD = 5;

/**
 * elapsedMs — время с начала печати (с первого нажатия), не с начала сессии.
 * ВАЖНО: target и typed должны быть актуальными значениями на момент завершения,
 * а не значениями, захваченными в замыкании в момент старта таймера — иначе
 * получим ложную 100% точность на пустой строке (баг, который был раньше).
 */
export function calculateStats(
  target: string,
  typed: string,
  elapsedMs: number
): TypingStats {
  const elapsedSeconds = elapsedMs / 1000;
  // защита от деления на ноль в первые миллисекунды
  const minutes = Math.max(elapsedSeconds / 60, 1 / 600);

  let correctChars = 0;
  let incorrectChars = 0;
  const len = Math.min(target.length, typed.length);
  for (let i = 0; i < len; i++) {
    if (typed[i] === target[i]) correctChars++;
    else incorrectChars++;
  }
  // символы сверх длины эталона (если пользователь продолжил печатать) — тоже ошибка
  if (typed.length > target.length) {
    incorrectChars += typed.length - target.length;
  }

  const totalTyped = typed.length;
  const wpm = correctChars / CHARS_PER_WORD / minutes;
  const accuracy = totalTyped > 0 ? (correctChars / totalTyped) * 100 : 0;

  return {
    wpm: Math.round(wpm),
    accuracy: Math.round(accuracy * 10) / 10,
    correctChars,
    incorrectChars,
    elapsedSeconds: Math.round(elapsedSeconds),
  };
}

export const TIME_PRESETS = [15, 30, 60, 120] as const;
export type TimePreset = (typeof TIME_PRESETS)[number];
