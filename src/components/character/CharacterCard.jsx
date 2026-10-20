// Commit: feat(character): add CharacterCard clickable card with mood glow and stats

import { MOOD_META } from "../../data/characters.js";
import RelationshipMeter from "../ui/RelationshipMeter.jsx";

export function getMoodGlow(mood) {
  const m = MOOD_META[mood];
  if (!m) return {};
  return { boxShadow: `0 0 12px ${m.borderColor}80, 0 0 28px ${m.borderColor}30`, borderColor: m.borderColor };
}

export default function CharacterCard({ character, charState, onSelect, t, lang = "en" }) {
  if (!character || !charState) return null;

  const mood = charState.mood;
  const moodMeta = MOOD_META[mood] ?? {};
  const moodGlow = getMoodGlow(mood);

  const initials = character.name
    ? character.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const personalities = character.personality?.slice(0, 3) ?? [];
  const funFacts = character.funFacts ?? [];
  const randomFact = funFacts.length > 0
    ? funFacts[Math.floor(Math.random() * funFacts.length)]
    : null;

  const title = character.title?.[lang] ?? character.title?.en ?? "";
  const accentColor = character.accentColor ?? "#64748b";

  return (
    <button
      onClick={() => onSelect?.(character.id)}
      className="group relative w-full text-left rounded-2xl border border-slate-700 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950"
      style={{ ...moodGlow, focusRingColor: accentColor }}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300"
        style={{ background: character.avatarBg ?? "linear-gradient(135deg,#1e293b,#0f172a)" }}
      />

      <div className="relative p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-lg font-mono font-bold text-white border-2"
            style={{
              background: character.avatarBg ?? "linear-gradient(135deg,#334155,#1e293b)",
              borderColor: accentColor,
              boxShadow: `0 0 10px ${accentColor}50`,
            }}
          >
            {initials}
          </div>

          {/* Name / handle / title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-mono font-bold text-white text-sm">{character.name}</h3>
              {character.flag && <span className="text-base">{character.flag}</span>}
              {character.pronoun && (
                <span className="font-mono text-[10px] text-slate-400 border border-slate-600 rounded px-1.5 py-0.5">
                  {character.pronoun}
                </span>
              )}
            </div>
            <p className="font-mono text-xs text-slate-400 truncate">@{character.handle}</p>
            {title && <p className="font-mono text-xs mt-0.5" style={{ color: accentColor }}>{title}</p>}
          </div>
        </div>

        {/* Mood */}
        <div className="flex items-center gap-2 bg-slate-900/60 rounded-lg px-3 py-1.5">
          <span className="text-base">{moodMeta.emoji ?? "😐"}</span>
          <span className="font-mono text-xs" style={{ color: moodMeta.borderColor ?? "#94a3b8" }}>
            {t?.moods?.[mood] ?? mood}
          </span>
        </div>

        {/* Relationship meter */}
        <RelationshipMeter
          value={charState.relationship ?? 0}
          accentColor={character.meterColor ?? "emerald"}
          t={t}
        />

        {/* Personality tags */}
        {personalities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {personalities.map((tag, i) => (
              <span
                key={i}
                className="font-mono text-[10px] bg-slate-800 border border-slate-700 text-slate-400 rounded-md px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Fun fact */}
        {randomFact && (
          <p className="font-mono text-[10px] text-slate-500 italic leading-relaxed border-l-2 border-slate-700 pl-2">
            {typeof randomFact === "object" ? randomFact[lang] ?? randomFact.en : randomFact}
          </p>
        )}

        {/* Hover CTA overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl"
          style={{ background: `${accentColor}15`, backdropFilter: "blur(1px)" }}
        >
          <span
            className="font-mono font-bold text-sm tracking-widest px-4 py-2 rounded-lg border"
            style={{
              color: accentColor,
              borderColor: accentColor,
              background: `${accentColor}20`,
              boxShadow: `0 0 14px ${accentColor}50`,
            }}
          >
            OPEN CHANNEL
          </span>
        </div>
      </div>
    </button>
  );
}
