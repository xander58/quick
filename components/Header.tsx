"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const THEME_KEY = "quick:theme";

interface HeaderProps {
  fontSize: number;
  soundEnabled: boolean;
  onFontSizeChange: (size: number) => void;
  onSoundToggle: () => void;
}

// Компактные иконки без эмодзи — минималистичные, обводкой, в духе Monkeytype.
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

function SoundOnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="4,9 8,9 13,4 13,20 8,15 4,15" />
      <path d="M17 8.5a5 5 0 0 1 0 7" />
      <path d="M19.5 6a8.5 8.5 0 0 1 0 12" />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="4,9 8,9 13,4 13,20 8,15 4,15" />
      <line x1="17" y1="9" x2="22" y2="14" />
      <line x1="22" y1="9" x2="17" y2="14" />
    </svg>
  );
}

function IconButton({
  onClick,
  active,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      aria-label={label}
      title={label}
      className={`flex items-center justify-center w-8 h-8 rounded-md text-muted hover:text-text hover:bg-surface transition-colors ${
        active ? "text-accent" : ""
      }`}
    >
      {children}
    </button>
  );
}

export default function Header({
  fontSize,
  soundEnabled,
  onFontSizeChange,
  onSoundToggle,
}: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(THEME_KEY);
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    sessionStorage.setItem(THEME_KEY, next ? "dark" : "light");
  };

  return (
    <header className="w-full max-w-4xl mx-auto flex items-start justify-between px-2 pt-2 pb-8">
      <div className="flex items-center gap-3">
        <Image src="/logo.svg" alt="Quick" width={36} height={36} className="rounded-lg" />
        <div>
          <h1 className="text-lg font-semibold tracking-tight leading-none">Quick</h1>
          <p className="text-xs text-muted mt-1">Онлайн тренажер быстрой печати</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onFontSizeChange(Math.max(16, fontSize - 2))}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Уменьшить шрифт"
          title="Уменьшить шрифт"
          className="w-8 h-8 rounded-md text-xs text-muted hover:text-text hover:bg-surface transition-colors"
        >
          A-
        </button>
        <button
          onClick={() => onFontSizeChange(Math.min(40, fontSize + 2))}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Увеличить шрифт"
          title="Увеличить шрифт"
          className="w-8 h-8 rounded-md text-sm text-muted hover:text-text hover:bg-surface transition-colors"
        >
          A+
        </button>
        <div className="w-px h-4 bg-muted/20 mx-1" />
        <IconButton onClick={onSoundToggle} active={soundEnabled} label="Переключить звук">
          {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
        </IconButton>
        <IconButton onClick={toggleTheme} label="Переключить тему">
          {isDark ? <SunIcon /> : <MoonIcon />}
        </IconButton>
      </div>
    </header>
  );
}
