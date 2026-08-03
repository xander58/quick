"use client";

// ЙЦУКЕН-раскладка. Ключи — это KeyboardEvent.code (физическая клавиша),
// а не .key, потому что .key зависит от системной раскладки пользователя —
// нам же нужно всегда показывать один и тот же физический ряд независимо
// от того, кириллица у пользователя или латиница в системе.
const LETTER_ROWS: { code: string; label: string }[][] = [
  [
    "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP",
  ].map((code, i) => ({
    code,
    label: "йцукенгшщзхъ"[i],
  })),
  [
    "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL",
  ].map((code, i) => ({
    code,
    label: "фывапролджэ"[i],
  })),
  [
    "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM",
  ].map((code, i) => ({
    code,
    label: "ячсмитьбю"[i],
  })),
];

interface KeyboardProps {
  activeCode?: string | null;
  errorCode?: string | null;
}

function keyClass(code: string, activeCode?: string | null, errorCode?: string | null) {
  const isActive = code === activeCode;
  const isError = code === errorCode;
  return [
    "rounded-lg flex items-center justify-center text-sm font-mono",
    "bg-surface border border-muted/20 transition-colors duration-100",
    isActive ? "bg-accent text-white border-accent" : "",
    isError ? "bg-error text-white border-error" : "",
  ].join(" ");
}

export default function Keyboard({ activeCode, errorCode }: KeyboardProps) {
  return (
    <div className="flex flex-col items-center gap-2 opacity-90">
      {LETTER_ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-2" style={{ paddingLeft: ri * 12 }}>
          {row.map(({ code, label }) => (
            <div key={code} className={`w-9 h-9 ${keyClass(code, activeCode, errorCode)}`}>
              {label}
            </div>
          ))}
          {ri === 0 && (
            <div
              className={`w-16 h-9 text-xs ${keyClass("Backspace", activeCode, errorCode)}`}
            >
              back
            </div>
          )}
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <div className={`w-64 h-9 text-xs ${keyClass("Space", activeCode, errorCode)}`}>
          space
        </div>
      </div>
    </div>
  );
}
