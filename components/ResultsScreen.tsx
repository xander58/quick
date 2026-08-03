"use client";

import { TypingStats } from "@/lib/typingEngine";

interface ResultsScreenProps {
  stats: TypingStats;
  onRestart: () => void;
}

export default function ResultsScreen({ stats, onRestart }: ResultsScreenProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="flex gap-12">
        <div className="text-center">
          <div className="text-5xl font-bold text-accent">{stats.wpm}</div>
          <div className="text-sm text-muted mt-1">слов/мин</div>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-text">{stats.accuracy}%</div>
          <div className="text-sm text-muted mt-1">точность</div>
        </div>
      </div>
      <div className="flex gap-6 text-sm text-muted">
        <span>верно: {stats.correctChars}</span>
        <span>ошибок: {stats.incorrectChars}</span>
        <span>время: {stats.elapsedSeconds}с</span>
      </div>
      <button
        onClick={onRestart}
        className="mt-4 px-6 py-2.5 rounded-lg bg-accent text-white font-medium hover:opacity-90 transition-opacity"
      >
        Начать заново
      </button>
    </div>
  );
}
