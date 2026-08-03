"use client";

import { useEffect, useRef } from "react";
import { CharStatus } from "@/lib/typingEngine";
import { preloadKeySound, playKeySound, shouldPlayForKey } from "@/lib/soundEngine";

interface TypingAreaProps {
  targetText: string;
  typedText: string;
  charStatuses: CharStatus[];
  fontSize: number;
  disabled: boolean;
  soundEnabled: boolean;
  onChange: (value: string) => void;
  onKeyPress: (code: string, isCorrect: boolean) => void;
}

const statusClass: Record<CharStatus, string> = {
  pending: "text-muted",
  correct: "text-text",
  incorrect: "text-error underline decoration-2 underline-offset-4",
};

export default function TypingArea({
  targetText,
  typedText,
  charStatuses,
  fontSize,
  disabled,
  soundEnabled,
  onChange,
  onKeyPress,
}: TypingAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [targetText]);

  // Прогреваем загрузку звука сразу при монтировании, чтобы первое
  // нажатие клавиши не звучало с задержкой на сетевой запрос файла.
  useEffect(() => {
    preloadKeySound();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Звук привязан именно к keydown (физическому нажатию), а не к onChange
    // (изменению значения) — так он ловит и Backspace, и повторный ввод
    // одного и того же символа, и в целом честнее соответствует "нажатию клавиши".
    if (soundEnabled && shouldPlayForKey(e.key)) {
      playKeySound();
    }

    // Подсветка клавиатуры — тоже не нужна на служебных клавишах.
    if (!shouldPlayForKey(e.key)) return;

    if (e.key === "Backspace") {
      // стирание — не ошибка, подсвечиваем нейтрально (акцентным цветом)
      onKeyPress("Backspace", true);
      return;
    }

    // e.key — это уже символ с учётом раскладки пользователя (в отличие от
    // e.code), поэтому им удобно сравнивать с ожидаемым символом текста.
    if (e.key.length !== 1) return;
    const expectedChar = targetText[typedText.length];
    const isCorrect =
      expectedChar !== undefined && e.key.toLowerCase() === expectedChar.toLowerCase();
    onKeyPress(e.code, isCorrect);
  };

  return (
    <div
      className="relative w-full max-w-3xl mx-auto cursor-text select-none"
      onClick={() => inputRef.current?.focus()}
    >
      <p
        style={{ fontSize }}
        className="font-mono leading-relaxed tracking-wide"
        aria-hidden
      >
        {targetText.split("").map((ch, i) => {
          const isCurrent = i === typedText.length;
          return (
            <span
              key={i}
              className={`${statusClass[charStatuses[i]]} ${
                isCurrent ? "border-l-2 border-caret" : ""
              }`}
            >
              {ch}
            </span>
          );
        })}
      </p>

      {/* Скрытый инпут — реальный захват ввода. Проще и надёжнее, чем
          глобальный keydown-листенер: браузер сам разруливает раскладку,
          автозамену, композицию клавиш и т.д.

          onBlur — подстраховка на случай, если фокус всё же куда-то уйдёт
          (например, через Tab или клик по элементу, который мы не
          предусмотрели). Основная защита — onMouseDown={preventDefault}
          на кнопках настроек, но эта подстраховка не даёт печати "сломаться"
          в принципе, пока сессия не завершена. */}
      <input
        ref={inputRef}
        value={typedText}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (!disabled) {
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
        disabled={disabled}
        autoFocus
        className="absolute inset-0 opacity-0 w-full h-full cursor-text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
    </div>
  );
}
