// ─────────────────────────────────────────────────────────────────────────────
// Sidebar.jsx — Developer AI Persona Stats & Partner Switcher
// High-tech Red, Black & White developer theme with Space Grotesk / JetBrains Mono
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { MOOD_META } from "../../data/characters.js";
import RelationshipMeter from "../ui/RelationshipMeter.jsx";
import StatBar from "../ui/StatBar.jsx";

const STAT_COLORS = {
  logic: "red",
  romance: "red",
  patience: "slate",
  caffeine: "amber",
};

export default function Sidebar({
  activeCharacter,
  charState,
  allCharacters = [],
  allCharStates = {},
  onSwitchCharacter,
  t,
  lang = "en",
  aiModeActive = false,
}) {
  const [factIdx, setFactIdx] = useState(0);

  const funFacts = activeCharacter?.funFacts ?? [];
  const currentFact = funFacts.length > 0 ? funFacts[factIdx % funFacts.length] : null;

  // Rotate facts every 6s
  useEffect(() => {
    if (funFacts.length <= 1) return;
    const timer = setInterval(() => setFactIdx((i) => i + 1), 6000);
    return () => clearInterval(timer);
  }, [funFacts.length]);

  if (!activeCharacter || !charState) return null;

  const mood = charState.mood || activeCharacter.defaultMood || "curious";
  const moodMeta = MOOD_META[mood] ?? {};

  const initials = activeCharacter.avatarInitials || (activeCharacter.name
    ? activeCharacter.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??");

  const bio = typeof activeCharacter.bio === 'object'
    ? (activeCharacter.bio[lang] || activeCharacter.bio.en || "")
    : (activeCharacter.bio || "");

  // Access stats from activeCharacter
  const stats = activeCharacter.stats || charState.stats || {};
  const statKeys = ["logic", "romance", "patience", "caffeine"];

  // Normalize allCharacters list (handle both Object and Array)
  const charList = Array.isArray(allCharacters) ? allCharacters : Object.values(allCharacters || {});
  // Filter other characters to strictly match current chosen gender (no mixing)
  const otherCharacters = charList.filter(
    (c) => c.gender === activeCharacter.gender && c.id !== activeCharacter.id
  );

  return (
    <aside
      className="w-64 shrink-0 bg-black border-r border-zinc-800 flex flex-col overflow-y-auto font-mono select-text"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#27272a transparent" }}
    >
      {/* Header */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/90">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-xs text-white font-bold tracking-widest">DEV.CONNECTIONS</span>
        </div>
        {aiModeActive && (
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-bold">
            🤖 AI
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 p-3 flex-1 bg-black">
        {/* Active partner card */}
        <div className="bg-zinc-950 border border-red-900/60 rounded-2xl p-3.5 space-y-3 shadow-lg shadow-red-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-black border-2 border-red-600 flex items-center justify-center text-sm font-mono font-bold text-white shrink-0 shadow-md">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs font-bold truncate text-white">
                {activeCharacter.name}
              </p>
              <p className="font-mono text-[10px] text-red-400 truncate">{activeCharacter.handle}</p>
            </div>
            <span className="text-xl">{moodMeta.emoji || "🤔"}</span>
          </div>

          {/* Mood status pill */}
          <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 border border-zinc-800 bg-black">
            <span className="text-xs">{moodMeta.emoji || "🤔"}</span>
            <span className="font-mono text-[10px] font-bold text-red-400">
              {t?.moods?.[mood] ?? mood}
            </span>
          </div>

          {/* Relationship meter */}
          <RelationshipMeter
            value={charState.relationship ?? activeCharacter.initialRelationship ?? 10}
            accentColor="red"
            t={t}
          />
        </div>

        {/* Stats */}
        {Object.keys(stats).length > 0 && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 space-y-2">
            <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mb-1 font-bold">
              {t?.partnerStats ?? "// partner.stats"}
            </p>
            {statKeys.map((key) =>
              stats[key] !== undefined ? (
                <StatBar
                  key={key}
                  label={t?.stats?.[key] ?? key}
                  value={stats[key]}
                  color={STAT_COLORS[key] ?? "slate"}
                />
              ) : null
            )}
          </div>
        )}

        {/* Bio terminal */}
        {bio && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3">
            <p className="font-mono text-[10px] text-zinc-400 mb-1 uppercase tracking-widest font-bold">
              {t?.partnerBio ?? "// partner.bio"}
            </p>
            <pre className="font-mono text-[10px] text-zinc-300 whitespace-pre-wrap leading-relaxed overflow-hidden">
              {bio}
            </pre>
          </div>
        )}

        {/* Rotating Fun fact */}
        {currentFact && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3">
            <p className="font-mono text-[10px] text-red-400 mb-1 uppercase tracking-widest font-bold">// fun fact</p>
            <p className="font-mono text-[10px] text-zinc-400 italic leading-relaxed">
              {typeof currentFact === "object" ? currentFact[lang] ?? currentFact.en : currentFact}
            </p>
          </div>
        )}

        {/* Switch partner buttons */}
        {otherCharacters.length > 0 && (
          <div className="space-y-1.5 mt-auto pt-2">
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              {t?.switchPartner ?? "// switch partner"}
            </p>
            {otherCharacters.map((c) => {
              const cState = allCharStates[c.id] ?? {};
              const cInitials = c.avatarInitials || (c.name ? c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "??");
              const cMood = cState.mood || c.defaultMood || "curious";
              const cMoodMeta = MOOD_META[cMood] || {};
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSwitchCharacter?.(c.id)}
                  className="w-full flex items-center gap-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-red-600 rounded-xl px-2.5 py-2 transition-all duration-200 text-left group shadow-sm"
                >
                  <div className="w-7 h-7 rounded-lg bg-black border border-zinc-800 group-hover:border-red-600 flex items-center justify-center text-[10px] font-mono font-bold text-white shrink-0">
                    {cInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs font-bold truncate text-white">{c.name}</p>
                    <p className="font-mono text-[10px] text-zinc-400 truncate">
                      {cState.relationship ?? c.initialRelationship ?? 10}% bond
                    </p>
                  </div>
                  <span className="text-sm shrink-0">{cMoodMeta.emoji || "🤔"}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
