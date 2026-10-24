// ─────────────────────────────────────────────────────────────────────────────
// CharacterCard.jsx — Displays Girlfriends & Boyfriends with stats & mood glow
// ─────────────────────────────────────────────────────────────────────────────

import { MOOD_META } from "../../data/characters.js";
import RelationshipMeter from "../ui/RelationshipMeter.jsx";

export function getMoodGlow(mood) {
  const m = MOOD_META[mood];
  if (!m) return {};
  const c = m.borderColor || "#64748b";
  return { boxShadow: `0 0 14px ${c}80, 0 0 30px ${c}30`, borderColor: c };
}

export default function CharacterCard({ character, charState, onSelect, t, lang = "en" }) {
  if (!character || !charState) return null;

  const mood = charState.mood || character.defaultMood || "curious";
  const moodMeta = MOOD_META[mood] ?? {};
  const moodGlow = getMoodGlow(mood);

  const initials = character.avatarInitials || (character.name
    ? character.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??");

  const personalities = (character.personalityTags ?? character.personality ?? []).slice(0, 3);
  const funFacts = character.funFacts ?? [];
  const randomFact = funFacts.length > 0 ? funFacts[0] : null;

  const title = typeof character.title === 'object'
    ? (character.title[lang] || character.title.en || "")
    : (character.title || "");

  const borderColor = character.borderColor || "#10b981";

  return (
    <div
      onClick={() => onSelect?.(character.id)}
      className="group relative w-full text-left  border-2 bg-slate-900/90 p-5 overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl flex flex-col justify-between"
      style={moodGlow}
    >
      {/* Gradient background overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${character.avatarBg || 'from-slate-800 to-slate-950'} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}
      />

      <div className="relative z-10 space-y-3.5">
        {/* Header row */}
        <div className="flex items-start gap-3.5">
          {/* Avatar */}
          <div
            className={`w-14 h-14  bg-gradient-to-br ${character.avatarBg || 'from-slate-800 to-slate-950'} flex items-center justify-center shrink-0 text-xl font-mono font-black text-white border-2 shadow-lg`}
            style={{
              borderColor: borderColor,
              boxShadow: `0 0 14px ${borderColor}50`,
            }}
          >
            {initials}
          </div>

          {/* Name / handle / title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className={`font-mono font-black text-base ${character.textClass || 'text-white'}`}>
                {character.name}
              </h3>
              {character.nationality && <span className="text-sm">{character.nationality}</span>}
              <span className="font-mono text-[10px] text-fuchsia-300 border border-fuchsia-800/80 bg-fuchsia-950/60  px-1.5 py-0.5">
                {character.gender === 'female' ? 'Girlfriend' : 'Boyfriend'}
              </span>
            </div>
            <p className="font-mono text-xs text-slate-500 mt-0.5">{character.handle}</p>
            {title && <p className="font-mono text-xs text-slate-300 mt-0.5 truncate">{title}</p>}
          </div>

          {/* Mood emoji */}
          <span className="text-[11px] shrink-0 font-mono text-slate-500 uppercase tracking-widest">mood</span>
        </div>

        {/* Mood description pill */}
        <div
          className={`flex items-center justify-between  px-3 py-1.5 border border-slate-700/50 ${moodMeta.bgClass || 'bg-slate-800/50'}`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: moodMeta.borderColor || borderColor }} />
            <span className={`font-mono text-xs font-bold ${moodMeta.textClass || 'text-cyan-400'}`}>
              {t?.moods?.[mood] ?? mood}
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-500 truncate ml-2">
            {t?.moodDesc?.[mood] || moodMeta.description || ""}
          </span>
        </div>

        {/* Relationship meter */}
        <RelationshipMeter
          value={charState.relationship ?? character.initialRelationship ?? 15}
          accentColor={character.accentColor ?? "emerald"}
          t={t}
        />

        {/* Personality tags */}
        {personalities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {personalities.map((tag, i) => (
              <span
                key={i}
                className="font-mono text-[10px] bg-slate-950 border border-slate-800 text-slate-400  px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Fun fact preview */}
        {randomFact && (
          <p className="font-mono text-[11px] text-slate-400 italic bg-slate-950/60 border border-slate-800/60  p-2.5 leading-relaxed">
            // {randomFact}
          </p>
        )}
      </div>

      {/* Action button */}
      <div
        className="relative z-10 w-full text-center py-2.5  font-mono text-xs font-bold transition-all duration-200 border mt-4 flex items-center justify-center gap-2 group-hover:bg-slate-800/90"
        style={{ borderColor: borderColor, color: borderColor }}
      >
        <span>{t?.openChannel ?? "OPEN CHANNEL"}</span>
        <span>→</span>
      </div>
    </div>
  );
}
