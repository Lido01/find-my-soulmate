// ─────────────────────────────────────────────────────────────────────────────
// MoodToast.jsx — Floating Red, Black & White developer notification toast
// ─────────────────────────────────────────────────────────────────────────────

import { MOOD_META } from "../../data/characters.js";
import { useLang } from "../../context/LanguageContext.jsx";

export default function MoodToast({ mood, visible }) {
  const { t } = useLang();
  const meta = MOOD_META[mood];

  if (!meta) return null;

  return (
    <div
      className={`fixed top-16 right-4 z-50 transition-all duration-500 font-mono select-none ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      <div className="bg-black/95 backdrop-blur border border-red-600/80   px-4 py-3 max-w-xs shadow-2xl shadow-red-950/50">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{meta.emoji}</span>
          <span className="text-sm font-bold text-red-400">
            {t?.moods?.[mood] ?? mood}
          </span>
        </div>
        <p className="text-xs text-zinc-300 leading-relaxed">{meta.description}</p>
      </div>
    </div>
  );
}
