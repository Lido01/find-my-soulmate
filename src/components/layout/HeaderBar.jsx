// Commit: feat(layout): add HeaderBar with breadcrumb, controls, clock, and reset confirm

import { useState, useEffect } from "react";
import { MOOD_META } from "../../data/characters.js";
import LanguageToggle from "../ui/LanguageToggle.jsx";
import { IconSettings, IconRefresh, IconChevronRight } from "../ui/Icons.jsx";

function useClock() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 10000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function HeaderBar({
  phase,
  activeCharacter,
  charState,
  onReset,
  onBack,
  onApiKeyClick,
  apiKeySet = false,
  t,
}) {
  const [resetConfirm, setResetConfirm] = useState(false);
  const clock = useClock();

  const isChat = phase === "chat";
  const mood = charState?.mood;
  const moodMeta = MOOD_META[mood] ?? {};

  function handleResetClick() {
    if (resetConfirm) {
      onReset?.();
      setResetConfirm(false);
    } else {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
    }
  }

  return (
    <header className="h-11 flex items-center gap-2 px-3 bg-slate-950 border-b border-slate-800 shrink-0 z-30">
      {/* macOS window dots */}
      <div className="flex items-center gap-1.5 mr-1">
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-amber-500/70" />
        <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
      </div>

      {/* Back button (chat phase only) */}
      {isChat && onBack && (
        <button
          onClick={onBack}
          className="font-mono text-xs text-slate-500 hover:text-slate-200 transition-colors px-2 py-1 rounded hover:bg-slate-800"
        >
          ← {t?.back ?? "back"}
        </button>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 font-mono text-xs">
        <span className="text-fuchsia-400 font-bold">find_my_soulmate</span>
        {isChat && activeCharacter && (
          <>
            <IconChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-slate-400">@{activeCharacter.handle}</span>
          </>
        )}
      </div>

      {/* Chat phase: partner mood pill */}
      {isChat && activeCharacter && moodMeta.emoji && (
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-full px-2 py-0.5 ml-1">
          <span className="text-xs">{moodMeta.emoji}</span>
          <span className="font-mono text-[10px] text-slate-400">{activeCharacter.name}</span>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right cluster */}
      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <LanguageToggle />

        {/* AI Mode button */}
        <button
          onClick={onApiKeyClick}
          className={`flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-lg border transition-all duration-200
            ${apiKeySet
              ? "border-emerald-600 text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60"
              : "border-slate-700 text-slate-400 bg-slate-900 hover:bg-slate-800 hover:text-slate-200"
            }
          `}
          title={t?.aiModeTooltip ?? "Configure AI Mode"}
        >
          <IconSettings className="w-3 h-3" />
          <span className="hidden sm:inline">⚙ AI Mode</span>
        </button>

        {/* Clock */}
        <span className="font-mono text-xs text-slate-500 tabular-nums hidden md:inline">{clock}</span>

        {/* Reset button (2-click confirm) */}
        <button
          onClick={handleResetClick}
          className={`flex items-center gap-1 font-mono text-xs px-2 py-1 rounded border transition-all duration-200
            ${resetConfirm
              ? "border-red-600 text-red-400 bg-red-950/50 animate-pulse"
              : "border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 hover:bg-slate-900"
            }
          `}
          title={resetConfirm ? "Click again to confirm" : "Reset game"}
        >
          <IconRefresh className="w-3 h-3" />
          <span className="hidden sm:inline">{resetConfirm ? (t?.confirmReset ?? "confirm?") : (t?.reset ?? "reset")}</span>
        </button>
      </div>
    </header>
  );
}
