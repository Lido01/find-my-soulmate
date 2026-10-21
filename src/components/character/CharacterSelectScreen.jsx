// ─────────────────────────────────────────────────────────────────────────────
// CharacterSelectScreen.jsx — Girlfriend / Boyfriend Filter & Profile Setup
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import CharacterCard from "./CharacterCard.jsx";
import { soundEngine } from '../../utils/audio.js';

export default function CharacterSelectScreen({
  allCharacters = {},
  allCharStates = {},
  onSelect,
  userProfile,
  onOpenOnboarding,
  t,
  lang = "en",
}) {
  // Initial filter from user profile preference ('female', 'male', or 'all')
  const [filter, setFilter] = useState(() => userProfile?.lookingFor || 'all');

  // Support both Object and Array
  const charList = Array.isArray(allCharacters) ? allCharacters : Object.values(allCharacters || {});

  // Filter based on selected tab
  const filteredChars = charList.filter((c) => {
    if (filter === 'female') return c.gender === 'female';
    if (filter === 'male') return c.gender === 'male';
    return true;
  });

  const femaleCount = charList.filter((c) => c.gender === 'female').length;
  const maleCount = charList.filter((c) => c.gender === 'male').length;

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col overflow-y-auto">
      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)",
        }}
      />

      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-20 flex flex-col flex-1 items-center px-4 pt-8 pb-12 max-w-5xl mx-auto w-full">
        {/* Top bar: System online + Edit profile badge */}
        <div className="w-full flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs text-emerald-400 tracking-widest uppercase">
              {t?.systemOnline ?? "SYSTEM ONLINE"}
            </span>
          </div>

          <button
            onClick={() => {
              soundEngine.playHeartbeat();
              onOpenOnboarding?.();
            }}
            className="flex items-center gap-2 font-mono text-xs px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 hover:border-fuchsia-500 text-slate-300 hover:text-white transition-all shadow-md"
          >
            <span>{userProfile?.emoji || '🧑‍💻'}</span>
            <span className="font-bold">{userProfile?.name || 'My Profile'}</span>
            <span className="text-slate-500">· ✏️ Edit</span>
          </button>
        </div>

        {/* App title */}
        <div className="text-center mb-3">
          <h1 className="font-mono text-4xl md:text-5xl font-black tracking-tight">
            <span className="text-slate-500">find</span>
            <span className="text-fuchsia-400">_</span>
            <span className="text-slate-300">my</span>
            <span className="text-fuchsia-400">_</span>
            <span className="text-emerald-400">soulmate</span>
          </h1>

          {/* Amharic subtitle */}
          {lang === "am" && (
            <p className="font-mono text-xl text-fuchsia-300 mt-2 tracking-widest opacity-90">
              ነፍስ_ጓደኛዬን_አግኝ
            </p>
          )}
        </div>

        {/* Tagline */}
        <p className="font-mono text-slate-400 text-sm mb-1 text-center">
          {t?.appSubtitle ?? "// Stop debugging alone. Find your dev soulmate."}
        </p>
        <p className="font-mono text-slate-600 text-xs mb-6 text-center">
          {lang === 'am' ? 'የሴት ጓደኛ ወይም የወንድ ጓደኛ ይምረጡ' : 'Choose to find a Girlfriend or a Boyfriend'}
        </p>

        {/* Girlfriend / Boyfriend Filter Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 mb-8 shadow-lg">
          <button
            type="button"
            onClick={() => {
              soundEngine.playHeartbeat();
              setFilter('all');
            }}
            className={`font-mono text-xs font-bold px-4 py-2 rounded-xl transition-all ${
              filter === 'all'
                ? 'bg-fuchsia-950 border border-fuchsia-600 text-fuchsia-300 shadow-md shadow-fuchsia-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            💖 {lang === 'am' ? 'ሁሉንም' : 'All Soulmates'} ({charList.length})
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playHeartbeat();
              setFilter('female');
            }}
            className={`font-mono text-xs font-bold px-4 py-2 rounded-xl transition-all ${
              filter === 'female'
                ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 shadow-md shadow-emerald-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👩‍💻 {lang === 'am' ? 'የሴት ጓደኛ' : 'Girlfriends'} ({femaleCount})
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playHeartbeat();
              setFilter('male');
            }}
            className={`font-mono text-xs font-bold px-4 py-2 rounded-xl transition-all ${
              filter === 'male'
                ? 'bg-cyan-950 border border-cyan-600 text-cyan-300 shadow-md shadow-cyan-950/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👨‍💻 {lang === 'am' ? 'የወንድ ጓደኛ' : 'Boyfriends'} ({maleCount})
          </button>
        </div>

        {/* Character cards grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredChars.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              charState={allCharStates[character.id] ?? { mood: character.defaultMood ?? "curious", relationship: character.initialRelationship ?? 15 }}
              onSelect={(id) => {
                soundEngine.playRomanticChime();
                onSelect(id);
              }}
              t={t}
              lang={lang}
            />
          ))}
        </div>

        {/* Bottom hint */}
        <p className="font-mono text-xs text-slate-600 mt-10 tracking-widest text-center">
          // audio voice narration & sound effects active · toggle anytime in settings
        </p>
      </div>
    </div>
  );
}
