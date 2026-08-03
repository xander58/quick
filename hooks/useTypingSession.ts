"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  calculateStats,
  getCharStatuses,
  TypingStats,
  CharStatus,
} from "@/lib/typingEngine";
import { getTextForMode, getMoreWords, TextMode } from "@/lib/textProvider";

export type SessionStatus = "idle" | "running" | "finished";

export interface Settings {
  duration: number; // секунды
  fontSize: number; // px
  soundEnabled: boolean;
  mode: TextMode;
  punctuation: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  duration: 30,
  fontSize: 24,
  soundEnabled: true,
  mode: "quote",
  punctuation: false,
};

export function useTypingSession(settings: Settings) {
  // ВАЖНО: начальное состояние — пустая строка, а не случайный текст.
  // Если генерировать текст прямо в useState(() => ...), он посчитается
  // один раз на сервере (SSR) и один раз на клиенте при гидратации —
  // получатся РАЗНЫЕ случайные тексты, и React выдаст ошибку
  // "Text content does not match server-rendered HTML". Текст задаём
  // только в эффекте ниже, который выполняется исключительно на клиенте.
  const [targetText, setTargetText] = useState("");
  const [typedText, setTypedText] = useState("");
  const [status, setStatus] = useState<SessionStatus>("idle");
  const [stats, setStats] = useState<TypingStats | null>(null);
  const [timeLeft, setTimeLeft] = useState(settings.duration);

  const startedAtRef = useRef<number | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Рефы дублируют актуальные значения targetText/typedText. Таймер
  // (setInterval) создаётся один раз в момент первого нажатия клавиши,
  // и его коллбэк — это замыкание, которое "видит" значения переменных
  // на момент СОЗДАНИЯ интервала, а не на момент срабатывания. Если бы
  // finish() читал typedText/targetText напрямую из состояния (через
  // замыкание), при завершении по таймеру он использовал бы устаревшее,
  // почти всегда пустое typedText — отсюда и была ложная точность 100%.
  // Через рефы finish() всегда читает то, что напечатано прямо сейчас.
  const targetTextRef = useRef("");
  const typedTextRef = useRef("");

  useEffect(() => {
    targetTextRef.current = targetText;
  }, [targetText]);

  useEffect(() => {
    typedTextRef.current = typedText;
  }, [typedText]);

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    clearTick();
    setStatus("finished");
    if (startedAtRef.current) {
      const elapsed = Date.now() - startedAtRef.current;
      setStats(
        calculateStats(targetTextRef.current, typedTextRef.current, elapsed)
      );
    }
  }, [clearTick]);

  const generateText = useCallback(() => {
    return getTextForMode(settings.mode, settings.punctuation);
  }, [settings.mode, settings.punctuation]);

  const restart = useCallback(() => {
    clearTick();
    startedAtRef.current = null;
    const next = generateText();
    setTargetText(next);
    targetTextRef.current = next;
    setTypedText("");
    typedTextRef.current = "";
    setStatus("idle");
    setStats(null);
    setTimeLeft(settings.duration);
  }, [clearTick, generateText, settings.duration]);

  // Генерация текста при монтировании и при смене режима/пунктуации,
  // пока сессия не начата. Выполняется только на клиенте (эффекты
  // никогда не запускаются на сервере), поэтому расхождений с SSR нет.
  useEffect(() => {
    if (status === "idle") {
      const next = generateText();
      setTargetText(next);
      targetTextRef.current = next;
      setTimeLeft(settings.duration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.mode, settings.punctuation, settings.duration]);

  const handleInputChange = useCallback(
    (value: string) => {
      if (status === "finished") return;

      if (status === "idle") {
        setStatus("running");
        startedAtRef.current = Date.now();
        tickRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              finish();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }

      setTypedText(value);
      typedTextRef.current = value;

      // для режима слов — если пользователь напечатал весь буфер, докидываем ещё
      if (settings.mode === "words" && value.length > targetTextRef.current.length - 20) {
        setTargetText((prev) => {
          const next = prev + " " + getMoreWords(settings.punctuation);
          targetTextRef.current = next;
          return next;
        });
      }
    },
    [status, finish, settings.mode, settings.punctuation]
  );

  // финиш при полном наборе текста в режиме цитаты
  useEffect(() => {
    if (
      status === "running" &&
      settings.mode === "quote" &&
      typedText.length >= targetText.length &&
      targetText.length > 0
    ) {
      finish();
    }
  }, [typedText, targetText, status, settings.mode, finish]);

  useEffect(() => clearTick, [clearTick]);

  const charStatuses: CharStatus[] = getCharStatuses(targetText, typedText);

  return {
    targetText,
    typedText,
    status,
    stats,
    timeLeft,
    charStatuses,
    handleInputChange,
    restart,
  };
}
