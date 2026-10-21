// ─────────────────────────────────────────────────────────────────────────────
// FooterConsole.jsx — Terminal Input, Quick Options, Romantic Drawer Toggle & Gifts
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { MOOD_META } from "../../data/characters.js";
import { IconGift, IconTerminal, IconSend, IconHeart } from "../ui/Icons.jsx";
import { soundEngine } from "../../utils/audio.js";

export default function FooterConsole({
  dialogue,
  character,
  charState,
  onChoice,
  onSendMessage,
  isTyping,
  t,
  lang = "en",
  onGiftClick,
  canGift = false,
  aiModeActive = false,
  onToggleLoveDrawer,
  loveDrawerOpen = false,
}) {
  const [inputText, setInputText] = useState("");
  const choices = dialogue?.choices ?? [];
  const mood = charState?.mood || character?.defaultMood || "curious";
  const moodMeta = MOOD_META[mood] ?? {};
  const borderColor = character?.borderColor ?? "#10b981";

  function handleFormSubmit(e) {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isTyping) return;
    soundEngine.playMessageBeep();
    onSendMessage?.(trimmed);
    setInputText("");
  }

  return (
    <footer className="border-t border-slate-800 bg-slate-950/95 backdrop-blur shrink-0">
      {/* Terminal title bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800/60">
        {/* macOS traffic lights */}
        <div className="flex items-center gap-1.5 mr-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <IconTerminal className="w-3.5 h-3.5" />
          <span className="font-mono text-xs tracking-widest font-semibold">
            {t?.devTerminal ?? "DEV_TERMINAL"}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Romantic Love Drawer Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playHeartbeat();
              onToggleLoveDrawer?.();
            }}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold border transition-all ${
              loveDrawerOpen
                ? 'bg-fuchsia-950 border-fuchsia-500 text-fuchsia-300 shadow-md shadow-fuchsia-900/40'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-fuchsia-300 hover:border-fuchsia-600'
            }`}
            title="Open Developer Love Indicators & Romantic Emojis"
          >
            <span>💖</span>
            <span className="hidden sm:inline">Love Hub</span>
          </button>

          {/* Mood indicator */}
          {moodMeta.emoji && (
            <div className="flex items-center gap-1">
              <span className="text-xs">{moodMeta.emoji}</span>
              <span className={`font-mono text-[10px] font-bold ${moodMeta.textClass || 'text-cyan-400'}`}>
                {t?.moods?.[mood] ?? mood}
              </span>
            </div>
          )}

          {/* Typing status */}
          {isTyping && (
            <span className="font-mono text-[10px] text-amber-400 animate-pulse">
              {t?.isTyping ?? "typing..."}
            </span>
          )}
        </div>
      </div>

      <div className="p-3 space-y-2.5">
        {/* Branching choices (when available in scripted mode) */}
        {choices.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                {t?.selectResponse ?? "QUICK RESPONSES"}
              </p>
              <span className="font-mono text-[10px] text-slate-600">
                {choices.length} options
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {choices.map((choice, i) => {
                const label = typeof choice === "object"
                  ? (choice[lang] ?? choice.label ?? choice.en ?? choice.text ?? "")
                  : choice;
                return (
                  <button
                    key={choice.id ?? i}
                    onClick={() => {
                      if (!isTyping) {
                        soundEngine.playMessageBeep();
                        onChoice?.(choice);
                      }
                    }}
                    disabled={isTyping}
                    className={`
                      group relative w-full text-left font-mono text-xs px-3 py-2 rounded-xl border
                      bg-slate-900/90 border-slate-700/80 text-slate-300
                      transition-all duration-200
                      hover:border-opacity-100 hover:text-white hover:bg-slate-800
                      ${isTyping ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                    `}
                    onMouseEnter={(e) => {
                      if (!isTyping) e.currentTarget.style.borderColor = borderColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "";
                    }}
                  >
                    <span className="text-slate-600 mr-1.5">{i + 1}.</span>
                    {label}
                    {!isTyping && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        ↵
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Freeform custom text input row */}
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-emerald-400 select-none">
              &gt;
            </span>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                aiModeActive
                  ? (lang === 'am' ? "ለ AI ነፍስ ጓደኛህ/ሽን ማንኛውንም መልእክት ጻፍ..." : "Chat freely with your AI soulmate in English or Amharic...")
                  : (lang === 'am' ? "መልእክት ይተይቡ ወይም ከላይ ይምረጡ..." : "Type custom message or choose options above...")
              }
              disabled={isTyping}
              className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl pl-7 pr-3 py-2.5 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className={`font-mono text-xs font-bold px-3 py-2.5 rounded-xl border flex items-center gap-1.5 transition-all
              ${!inputText.trim() || isTyping
                ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                : "bg-emerald-950 border-emerald-700 text-emerald-300 hover:bg-emerald-900 cursor-pointer shadow-md shadow-emerald-900/30"
              }`}
          >
            <IconSend className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>

          {/* Gift button */}
          {canGift && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playHeartbeat();
                onGiftClick();
              }}
              disabled={isTyping}
              className="flex items-center gap-1.5 font-mono text-xs px-3 py-2.5 rounded-xl border border-fuchsia-700/60 bg-fuchsia-950/40 text-fuchsia-300 hover:bg-fuchsia-900/50 hover:border-fuchsia-500 transition-all shadow-md shadow-fuchsia-900/20"
              title={t?.sendGift ?? "Send a Gift"}
            >
              <IconGift className="w-3.5 h-3.5 text-fuchsia-400" />
              <span className="hidden sm:inline">{t?.sendGift ?? "🎁 Gift"}</span>
            </button>
          )}
        </form>
      </div>
    </footer>
  );
}
