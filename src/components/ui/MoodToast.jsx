// Commit: feat(ui): add MoodToast floating notification component

import { MOOD_META } from "../../data/characters.js";
import { useLang } from "../../context/LanguageContext.jsx";

export default function MoodToast({ mood, visible }) {
  const { t } = useLang();
  const meta = MOOD_META[mood];

  if (!meta) return null;

  return (
    <div
      className={`fixed top-16 right-4 z-50 transition-all duration-500 ${
        visible
          ? "opacity-100 translate-y-0 animate-bounce"
          : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
    >
      <div
        className="font-mono bg-slate-900/95 backdrop-blur border rounded-xl px-4 py-3 max-w-xs shadow-2xl"
        style={{
          borderColor: meta.borderColor,
          boxShadow: `0 0 12px ${meta.borderColor}80, 0 0 28px ${meta.borderColor}30`,
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{meta.emoji}</span>
          <span className="text-sm font-bold" style={{ color: meta.borderColor }}>
            {t?.moods?.[mood] ?? mood}
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">{meta.description}</p>
      </div>
    </div>
  );
}
