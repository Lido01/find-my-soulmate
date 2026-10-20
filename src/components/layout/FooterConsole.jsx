// Commit: feat(layout): add FooterConsole with choice buttons, gift button, and terminal UI

import { MOOD_META } from "../../data/characters.js";
import { IconGift } from "../ui/Icons.jsx";

export default function FooterConsole({
  dialogue,
  character,
  charState,
  onChoice,
  isTyping,
  t,
  lang = "en",
  onGiftClick,
  canGift = false,
}) {
  const choices = dialogue?.choices ?? [];
  const mood = charState?.mood;
  const moodMeta = MOOD_META[mood] ?? {};
  const accentColor = character?.accentColor ?? "#64748b";
  const showGift = canGift && (charState?.relationship ?? 0) > 35;

  return (
    <footer className="border-t border-slate-800 bg-slate-950/95 backdrop-blur">
      {/* Terminal title bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800/60">
        {/* macOS traffic lights */}
        <div className="flex items-center gap-1.5 mr-2">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
        <span className="font-mono text-xs text-slate-500 tracking-widest">DEV_TERMINAL</span>

        <div className="ml-auto flex items-center gap-3">
          {/* Mood indicator */}
          {moodMeta.emoji && (
            <div className="flex items-center gap-1">
              <span className="text-xs">{moodMeta.emoji}</span>
              <span className="font-mono text-[10px]" style={{ color: moodMeta.borderColor ?? "#94a3b8" }}>
                {t?.moods?.[mood] ?? mood}
              </span>
            </div>
          )}
          {/* Typing status */}
          {isTyping && (
            <span className="font-mono text-[10px] text-slate-500 animate-pulse">typing...</span>
          )}
        </div>
      </div>

      {/* Choices + Gift button */}
      <div className="p-3 flex flex-col gap-2">
        {/* Choice grid */}
        {choices.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {choices.map((choice, i) => {
              const label = typeof choice === "object" ? choice[lang] ?? choice.en ?? choice.text : choice;
              return (
                <button
                  key={i}
                  onClick={() => !isTyping && onChoice?.(choice, i)}
                  disabled={isTyping}
                  className={`
                    group relative w-full text-left font-mono text-xs px-3 py-2.5 rounded-lg border
                    bg-slate-900 border-slate-700 text-slate-300
                    transition-all duration-200
                    hover:border-opacity-80 hover:text-white hover:bg-slate-800
                    ${isTyping ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                  `}
                  style={
                    !isTyping
                      ? { "--hover-border": accentColor }
                      : {}
                  }
                  onMouseEnter={(e) => {
                    if (!isTyping) e.currentTarget.style.borderColor = accentColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "";
                  }}
                >
                  <span className="text-slate-600 mr-1.5">{i + 1}.</span>
                  {label}
                  {!isTyping && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      ↵
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Gift button */}
        {showGift && (
          <div className="flex justify-end">
            <button
              onClick={onGiftClick}
              className="flex items-center gap-2 font-mono text-xs px-3 py-2 rounded-lg border border-amber-700/60 bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 hover:border-amber-500 transition-all duration-200"
            >
              <IconGift className="w-3.5 h-3.5" />
              {t?.sendGift ?? "Send Gift"} 🎁
            </button>
          </div>
        )}
      </div>
    </footer>
  );
}
