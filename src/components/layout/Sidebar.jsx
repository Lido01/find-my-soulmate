// Commit: feat(layout): add Sidebar with partner info, stats, bio, and switch buttons

import { useState, useEffect } from "react";
import { MOOD_META } from "../../data/characters.js";
import RelationshipMeter from "../ui/RelationshipMeter.jsx";
import StatBar from "../ui/StatBar.jsx";

export function getMoodGlow(mood) {
  const m = MOOD_META[mood];
  if (!m) return {};
  return { boxShadow: `0 0 12px ${m.borderColor}80, 0 0 28px ${m.borderColor}30`, borderColor: m.borderColor };
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

  // Rotate facts every 5s
  useEffect(() => {
    if (funFacts.length <= 1) return;
    const timer = setInterval(() => setFactIdx((i) => i + 1), 5000);
    return () => clearInterval(timer);
  }, [funFacts.length]);

  if (!activeCharacter || !charState) return null;

  const mood = charState.mood;
  const moodMeta = MOOD_META[mood] ?? {};
  const moodGlow = getMoodGlow(mood);

  const initials = activeCharacter.name
    ? activeCharacter.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const bio = activeCharacter.bio?.[lang] ?? activeCharacter.bio?.en ?? "";
  const accentColor = activeCharacter.accentColor ?? "#64748b";

  const stats = charState.stats ?? {};
  const statKeys = ["logic", "romance", "patience", "caffeine"];

  const otherCharacters = allCharacters.filter((c) => c.id !== activeCharacter.id);

  return (
    <aside className="w-64 shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col overflow-y-auto"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#1e293b transparent" }}>

      {/* Header */}
      <div className="p-3 border-b border-slate-800 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono text-xs text-slate-300 font-bold tracking-widest">Dev.Connections</span>
      </div>

      <div className="flex flex-col gap-3 p-3 flex-1">
        {/* Active partner card */}
        <div
          className="bg-slate-900 border rounded-xl p-3 space-y-2 transition-all duration-300"
          style={moodGlow}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-mono font-bold text-white border-2 shrink-0"
              style={{
                background: activeCharacter.avatarBg ?? "linear-gradient(135deg,#334155,#1e293b)",
                borderColor: accentColor,
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs font-bold text-white truncate">{activeCharacter.name}</p>
              <p className="font-mono text-[10px] text-slate-500 truncate">@{activeCharacter.handle}</p>
            </div>
          </div>

          {/* Mood status */}
          <div
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5"
            style={{ background: `${moodMeta.borderColor ?? "#64748b"}15` }}
          >
            <span className="text-sm">{moodMeta.emoji ?? "😐"}</span>
            <span className="font-mono text-[10px]" style={{ color: moodMeta.borderColor ?? "#94a3b8" }}>
              {t?.moods?.[mood] ?? mood}
            </span>
          </div>

          {/* Relationship meter */}
          <RelationshipMeter
            value={charState.relationship ?? 0}
            accentColor={activeCharacter.meterColor ?? "emerald"}
            t={t}
          />
        </div>

        {/* Stats */}
        {Object.keys(stats).length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 space-y-2">
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">// stats</p>
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

        {/* AI mode badge */}
        {aiModeActive && (
          <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/50 rounded-lg px-3 py-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="font-mono text-xs text-emerald-300 font-bold">🤖 AI Active</span>
          </div>
        )}

        {/* Bio terminal */}
        {bio && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <p className="font-mono text-[10px] text-slate-500 mb-1 uppercase tracking-widest">// bio</p>
            <pre className="font-mono text-[10px] text-slate-400 whitespace-pre-wrap leading-relaxed overflow-hidden">
              {bio}
            </pre>
          </div>
        )}

        {/* Fun fact */}
        {currentFact && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
            <p className="font-mono text-[10px] text-slate-500 mb-1 uppercase tracking-widest">// fun fact</p>
            <p className="font-mono text-[10px] text-slate-400 italic leading-relaxed">
              {typeof currentFact === "object" ? currentFact[lang] ?? currentFact.en : currentFact}
            </p>
          </div>
        )}

        {/* Switch partner */}
        {otherCharacters.length > 0 && (
          <div className="space-y-1.5">
            <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">// switch partner</p>
            {otherCharacters.map((c) => {
              const cState = allCharStates[c.id] ?? {};
              const cInitials = c.name ? c.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "??";
              return (
                <button
                  key={c.id}
                  onClick={() => onSwitchCharacter?.(c.id)}
                  className="w-full flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 rounded-lg px-2 py-1.5 transition-all duration-200 text-left"
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold text-white shrink-0"
                    style={{ background: c.avatarBg ?? "linear-gradient(135deg,#334155,#1e293b)" }}
                  >
                    {cInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[10px] text-slate-300 truncate">{c.name}</p>
                    <p className="font-mono text-[9px] text-slate-600 truncate">
                      {cState.relationship ?? 0}% bond
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
