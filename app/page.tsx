"use client";

import { useCallback, useRef, useState } from "react";
import { useTypingSession, DEFAULT_SETTINGS, Settings } from "@/hooks/useTypingSession";
import Header from "@/components/Header";
import SettingsPanel from "@/components/SettingsPanel";
import TypingArea from "@/components/TypingArea";
import Keyboard from "@/components/Keyboard";
import ResultsScreen from "@/components/ResultsScreen";

// Сколько подсветка держится на клавише после нажатия, прежде чем погаснуть.
const HIGHLIGHT_MS = 150;

export default function Home() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    targetText,
    typedText,
    status,
    stats,
    timeLeft,
    charStatuses,
    handleInputChange,
    restart,
  } = useTypingSession(settings);

  const handleKeyPress = useCallback((code: string, isCorrect: boolean) => {
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);

    if (isCorrect) {
      setActiveCode(code);
      setErrorCode(null);
    } else {
      setErrorCode(code);
      setActiveCode(null);
    }

    highlightTimeoutRef.current = setTimeout(() => {
      setActiveCode(null);
      setErrorCode(null);
    }, HIGHLIGHT_MS);
  }, []);

  // Сброс сессии нужен, только если поменялась настройка, влияющая на
  // сам текст или таймер (длительность, режим, пунктуация). Звук и размер
  // шрифта — чисто косметические, они не должны прерывать печать.
  const SESSION_AFFECTING_KEYS: (keyof Settings)[] = ["duration", "mode", "punctuation"];

  const updateSettings = (patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    const affectsSession = Object.keys(patch).some((key) =>
      SESSION_AFFECTING_KEYS.includes(key as keyof Settings)
    );
    if (affectsSession && status !== "idle") restart();
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-6">
      <Header
        fontSize={settings.fontSize}
        soundEnabled={settings.soundEnabled}
        onFontSizeChange={(fontSize) => updateSettings({ fontSize })}
        onSoundToggle={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
      />

      <div className="flex-1 w-full flex flex-col items-center justify-center">
        <SettingsPanel
          settings={settings}
          onChange={updateSettings}
          disabled={status === "running"}
        />

        {status !== "finished" && (
          <div className="text-3xl font-mono text-muted mb-6 tabular-nums">
            {timeLeft}
          </div>
        )}

        {status === "finished" && stats ? (
          <ResultsScreen stats={stats} onRestart={restart} />
        ) : (
          <TypingArea
            targetText={targetText}
            typedText={typedText}
            charStatuses={charStatuses}
            fontSize={settings.fontSize}
            disabled={status === "finished"}
            soundEnabled={settings.soundEnabled}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
        )}

        <div className="mt-14">
          <Keyboard activeCode={activeCode} errorCode={errorCode} />
        </div>

        {status === "idle" && (
          <p className="text-sm text-muted mt-6">
            Просто начните печатать — таймер запустится автоматически
          </p>
        )}
      </div>
    </main>
  );
}
