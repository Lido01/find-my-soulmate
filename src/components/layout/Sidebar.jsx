// Commit: fix(layout): support object/array allCharacters, correct stats access and avatar gradients

import { useState, useEffect } from "react";
import { MOOD_META } from "../../data/characters.js";
import RelationshipMeter from "../ui/RelationshipMeter.jsx";
import StatBar from "../ui/StatBar.jsx";

export function getMoodGlow(mood) {
  const m = MOOD_META[mood];
  if (!m) return {};
  const c = m.borderColor || "#64748b";
  return { boxShadow: `0 0 12px ${c}80, 0 0 28px ${c}30`, borderColor: c };
}

const STAT_COLORS = {
  logic: "cyan",
  romance: "fuchsia",
  patience: "emerald",
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
  const moodGlow = getMoodGlow(mood);

  const initials = activeCharacter.avatarInitials || (activeCharacter.name
    ? activeCharacter.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??");

  const bio = typeof activeCharacter.bio === 'object'
    ? (activeCharacter.bio[lang] || activeCharacter.bio.en || "")
    : (activeCharacter.bio || "");

  const borderColor = activeCharacter.borderColor || "#10b981";

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
      className="w-64 shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col overflow-y-auto"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#1e293b transparent" }}
    >
      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs text-slate-300 font-bold tracking-widest">Dev.Connections</span>
        </div>
        {aiModeActive && (
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 font-bold">
            🤖 AI
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 p-3 flex-1">
        {/* Active partner card */}
        <div
          className="bg-slate-900 border rounded-xl p-3 space-y-2.5 transition-all duration-300 relative overflow-hidden"
          style={moodGlow}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeCharacter.avatarBg || 'from-slate-800 to-slate-950'} flex items-center justify-center text-sm font-mono font-bold text-white border-2 shrink-0 shadow-md`}
              style={{ borderColor: borderColor }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-mono text-xs font-bold truncate ${activeCharacter.textClass || 'text-white'}`}>
                {activeCharacter.name}
              </p>
              <p className="font-mono text-[10px] text-slate-500 truncate">{activeCharacter.handle}</p>
            </div>
            <span className="text-xl">{moodMeta.emoji || "🤔"}</span>
          </div>

          {/* Mood status pill */}
          <div
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 border border-slate-700/50 ${moodMeta.bgClass || 'bg-slate-800/60'}`}
          >
            <span className="text-xs">{moodMeta.emoji || "🤔"}</span>
            <span className={`font-mono text-[10px] font-bold ${moodMeta.textClass || 'text-cyan-400'}`}>
              {t?.moods?.[mood] ?? mood}
            </span>
          </div>

          {/* Relationship meter */}
          <RelationshipMeter
            value={charState.relationship ?? activeCharacter.initialRelationship ?? 10}
            accentColor={activeCharacter.accentColor ?? "emerald"}
            t={t}
          />
        </div>

        {/* Stats */}
        {Object.keys(stats).length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">
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
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <p className="font-mono text-[10px] text-slate-500 mb-1 uppercase tracking-widest">
              {t?.partnerBio ?? "// partner.bio"}
            </p>
            <pre className="font-mono text-[10px] text-slate-300 whitespace-pre-wrap leading-relaxed overflow-hidden">
              {bio}
            </pre>
          </div>
        )}

        {/* Rotating Fun fact */}
        {currentFact && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <p className="font-mono text-[10px] text-slate-500 mb-1 uppercase tracking-widest">// fun fact</p>
            <p className="font-mono text-[10px] text-slate-400 italic leading-relaxed">
              {typeof currentFact === "object" ? currentFact[lang] ?? currentFact.en : currentFact}
            </p>
          </div>
        )}

        {/* Switch partner buttons */}
        {otherCharacters.length > 0 && (
          <div className="space-y-1.5 mt-auto pt-2">
            <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">
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
                  onClick={() => onSwitchCharacter?.(c.id)}
                  className="w-full flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-lg px-2.5 py-2 transition-all duration-200 text-left group"
                >
                  <div
                    className={`w-7 h-7 rounded-lg bg-gradient-to-br ${c.avatarBg || 'from-slate-800 to-slate-950'} flex items-center justify-center text-[10px] font-mono font-bold text-white shrink-0`}
                  >
                    {cInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-mono text-xs font-bold truncate ${c.textClass || 'text-white'}`}>{c.name}</p>
                    <p className="font-mono text-[10px] text-slate-500 truncate">
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
