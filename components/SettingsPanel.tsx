"use client";

import { TIME_PRESETS } from "@/lib/typingEngine";
import { Settings } from "@/hooks/useTypingSession";

interface SettingsPanelProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  disabled: boolean;
}

export default function SettingsPanel({
  settings,
  onChange,
  disabled,
}: SettingsPanelProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
      <div className="flex gap-1 bg-surface rounded-lg p-1 border border-muted/20">
        {TIME_PRESETS.map((preset) => (
          <button
            key={preset}
            disabled={disabled}
            onClick={() => onChange({ duration: preset })}
            onMouseDown={(e) => e.preventDefault()}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              settings.duration === preset
                ? "bg-accent text-white"
                : "text-muted hover:text-text"
            } disabled:opacity-50`}
          >
            {preset}с
          </button>
        ))}
      </div>

      <div className="flex gap-1 bg-surface rounded-lg p-1 border border-muted/20">
        {(["quote", "words"] as const).map((mode) => (
          <button
            key={mode}
            disabled={disabled}
            onClick={() => onChange({ mode })}
            onMouseDown={(e) => e.preventDefault()}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              settings.mode === mode
                ? "bg-accent text-white"
                : "text-muted hover:text-text"
            } disabled:opacity-50`}
          >
            {mode === "quote" ? "Цитаты" : "Слова"}
          </button>
        ))}
      </div>

      <div className="flex gap-1 bg-surface rounded-lg p-1 border border-muted/20">
        {[
          { value: false, label: "Без пунктуации" },
          { value: true, label: "С пунктуацией" },
        ].map((opt) => (
          <button
            key={String(opt.value)}
            disabled={disabled}
            onClick={() => onChange({ punctuation: opt.value })}
            onMouseDown={(e) => e.preventDefault()}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              settings.punctuation === opt.value
                ? "bg-accent text-white"
                : "text-muted hover:text-text"
            } disabled:opacity-50`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
