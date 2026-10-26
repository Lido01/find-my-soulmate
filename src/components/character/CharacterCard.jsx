// ─────────────────────────────────────────────────────────────────────────────
// CharacterCard.jsx — Displays Girlfriends & Boyfriends in Red, Black & White
// High-tech developer theme with Space Grotesk / JetBrains Mono
// ─────────────────────────────────────────────────────────────────────────────

import { MOOD_META } from "../../data/characters.js";
import RelationshipMeter from "../ui/RelationshipMeter.jsx";

export default function CharacterCard({ character, charState, onSelect, t, lang = "en" }) {
  if (!character || !charState) return null;

  const mood = charState.mood || character.defaultMood || "curious";
  const moodMeta = MOOD_META[mood] ?? {};

  const initials = character.avatarInitials || (character.name
    ? character.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??");

  const personalities = (character.personalityTags ?? character.personality ?? []).slice(0, 3);
  const funFacts = character.funFacts ?? [];
  const randomFact = funFacts.length > 0 ? funFacts[0] : null;

  const title = typeof character.title === 'object'
    ? (character.title[lang] || character.title.en || "")
    : (character.title || "");

  return (
    <div
      onClick={() => onSelect?.(character.id)}
      className="group relative w-full text-left   border-2 border-zinc-800 hover:border-red-600 bg-zinc-950 p-5 overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-2xl flex flex-col justify-between font-mono select-text"
    >
      {/* Red ambient highlight */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-600/10 blur-2xl group-hover:bg-red-600/25 transition-all" />

      <div className="relative z-10 space-y-3.5">
        {/* Header row */}
        <div className="flex items-start gap-3.5">
          {/* Avatar */}
          <div className="w-14 h-14   bg-black flex items-center justify-center shrink-0 text-xl font-mono font-black text-white border-2 border-red-600 shadow-lg shadow-red-950/40">
            {initials}
          </div>

          {/* Name / handle / title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-heading font-black text-base text-white group-hover:text-red-400 transition-colors">
                {character.name}
              </h3>
              {character.nationality && <span className="text-sm">{character.nationality}</span>}
              <span className="font-mono text-[10px] text-red-400 border border-red-900/60 bg-black   px-2 py-0.5 font-bold">
                {character.gender === 'female' ? 'Girlfriend' : 'Boyfriend'}
              </span>
            </div>
            <p className="font-mono text-xs text-zinc-500 mt-0.5">{character.handle}</p>
            {title && <p className="font-mono text-xs text-zinc-300 mt-0.5 truncate">{title}</p>}
          </div>

          {/* Mood indicator */}
          <span className="text-xl shrink-0 p-1 bg-black   border border-zinc-800">{moodMeta.emoji}</span>
        </div>

        {/* Mood description pill */}
        <div className="flex items-center justify-between   px-3 py-1.5 border border-zinc-800 bg-black">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2   bg-red-500" />
            <span className="font-mono text-xs font-bold text-red-400">
              {t?.moods?.[mood] ?? mood}
            </span>
          </div>
          <span className="font-mono text-[10px] text-zinc-400 truncate ml-2">
            {t?.moodDesc?.[mood] || moodMeta.description || ""}
          </span>
        </div>

        {/* Relationship meter */}
        <RelationshipMeter
          value={charState.relationship ?? character.initialRelationship ?? 15}
          accentColor="red"
          t={t}
        />

        {/* Personality tags */}
        {personalities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {personalities.map((tag, i) => (
              <span
                key={i}
                className="font-mono text-[10px] bg-black border border-zinc-800 text-zinc-300   px-2 py-0.5 font-bold"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Fun fact preview */}
        {randomFact && (
          <p className="font-mono text-[11px] text-zinc-400 italic bg-black/60 border border-zinc-800   p-2.5 leading-relaxed">
            // {randomFact}
          </p>
        )}
      </div>

      {/* Action button */}
      <div className="relative z-10 w-full text-center py-2.5   font-mono text-xs font-bold transition-all duration-200 border border-zinc-700 bg-black text-white group-hover:bg-red-600 group-hover:border-red-500 mt-4 flex items-center justify-center gap-2 shadow-sm">
        <span>{t?.openChannel ?? "OPEN CHANNEL"}</span>
        <span>→</span>
      </div>
    </div>
  );
}
