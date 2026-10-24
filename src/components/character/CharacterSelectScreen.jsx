// ─────────────────────────────────────────────────────────────────────────────
// CharacterSelectScreen.jsx — Strict Category Choice (Girlfriend OR Boyfriend)
// Locks into the chosen category without showing the other until changed in Settings/Profile.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import CharacterCard from "./CharacterCard.jsx";
import { soundEngine } from '../../utils/audio.js';
import { IconChevronRight, IconLogIn } from '../ui/Icons.jsx';

export default function CharacterSelectScreen({
  allCharacters = {},
  allCharStates = {},
  onSelect,
  userProfile,
  onOpenRegister,
  onOpenLogin,
  onOpenOnboarding,
  onOpenAbout,
  onSwitchToRealWs,
  t,
  lang = "en",
}) {
  const [chosenCategory, setChosenCategory] = useState(null);

  // Normalize allCharacters list (handle both Object and Array)
  const charList = Array.isArray(allCharacters) ? allCharacters : Object.values(allCharacters || {});

  const girlfriends = charList.filter((c) => c.gender === 'female');
  const boyfriends = charList.filter((c) => c.gender === 'male');

  // If user has registered and chosen a target, lock into it strictly; otherwise use local choice or null
  const activeTarget = (userProfile?.isRegistered && userProfile?.lookingFor && userProfile.lookingFor !== 'all')
    ? userProfile.lookingFor
    : chosenCategory;

  // Strictly filter by active target (never show both or mixed)
  const activeRoster = activeTarget === 'female'
    ? girlfriends
    : activeTarget === 'male'
      ? boyfriends
      : [];

  function handleSelectCategory(cat) {
    if (!userProfile?.isRegistered) {
      soundEngine.playHeartbeat();
      onOpenRegister?.(cat);
      return;
    }
    soundEngine.playRomanticChime();
    setChosenCategory(cat);
  }

  function handleCardClick(character) {
    if (!userProfile?.isRegistered) {
      soundEngine.playHeartbeat();
      onOpenRegister?.(character.gender);
      return;
    }
    soundEngine.playRomanticChime();
    onSelect(character.id);
  }

  const isAm = lang === 'am';

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
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-900/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-900/20 blur-3xl" />
      </div>

      <div className="relative z-20 flex flex-col flex-1 items-center px-4 pt-6 pb-12 max-w-5xl mx-auto w-full">
        {/* App title */}
        <div className="text-center mb-2">
          <h1 className="font-mono text-4xl md:text-5xl font-black tracking-tight">
            <span className="text-slate-500">find</span>
            <span className="text-fuchsia-400">_</span>
            <span className="text-slate-300">my</span>
            <span className="text-fuchsia-400">_</span>
            <span className="text-emerald-400">soulmate</span>
          </h1>
        </div>

        {/* Tagline */}
        <p className="font-mono text-slate-400 text-sm mb-1 text-center">
          // Stop debugging alone. Find your dev soulmate.
        </p>

        {/* ═══════════════════════════════════════════════════════════════════
            FIRST TIME GATE SCREEN (ONLY SHOWN IF NO CHOICE HAS BEEN MADE YET)
            ═══════════════════════════════════════════════════════════════════ */}
        {activeTarget === null ? (
          <div className="w-full max-w-3xl mt-6 animate-fade-in space-y-6">
            {!userProfile?.isRegistered && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl border border-cyan-700/60 bg-cyan-950/40 shadow-lg shadow-cyan-950/20">
                <div>
                  <p className="eyebrow">Session ready</p>
                  <p className="text-sm text-slate-200 mt-1">Log in again to restore your dev card, or start a new profile.</p>
                </div>
                <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/70 bg-cyan-900/40 px-3 py-2 text-xs font-bold text-cyan-100 hover:bg-cyan-800/60"
                  >
                    <IconLogIn className="w-4 h-4" />
                    Log in again
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenRegister?.()}
                    className="shrink-0 inline-flex items-center justify-center gap-1 rounded-xl border border-slate-600 bg-slate-900/70 px-3 py-2 text-xs font-bold text-slate-200 hover:border-cyan-700 hover:text-cyan-200"
                  >
                    Start new profile
                    <IconChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
            {/* Exactly 2 Options: Strictly Girlfriend OR Boyfriend */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Option A: Girlfriend */}
              <div
                onClick={() => handleSelectCategory('female')}
                className="group relative border-2 border-slate-800 hover:border-fuchsia-500 bg-slate-900/90 p-6 cursor-pointer transition-all duration-300 hover:scale-[1.03] shadow-2xl overflow-hidden flex flex-col justify-between "
              >
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-fuchsia-600/20 blur-2xl group-hover:bg-fuchsia-600/35 transition-all" />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl p-3 bg-fuchsia-950/60 border border-fuchsia-800/80  inline-block">
                      F
                    </span>
                    <span className="font-mono text-xs font-bold px-2.5 py-1  bg-fuchsia-950 border border-fuchsia-700 text-fuchsia-300">
                      {girlfriends.length} {isAm ? 'ጓደኞች' : 'Profiles'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-mono text-xl font-black text-white group-hover:text-fuchsia-300 transition-colors">
                      {isAm ? 'የሴት ጓደኛ ፈልግ' : 'Find a Girlfriend'}
                    </h3>
                    <p className="font-mono text-xs text-slate-400 mt-1 leading-relaxed">
                      {isAm
                        ? 'ሊና (ከርነል ጠባቂ)፣ ዳኒ (ፊት-ኤንድ) እና ሰናይት (AI መሃንዲስ)'
                        : 'Connect with Lina, Dani, or Senait — from Linux kernel maintainers to AI researchers.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    {girlfriends.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center gap-1.5 px-2.5 py-1  bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300"
                      >
                        <span>{g.nationality}</span>
                        <span className="font-bold">{g.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-fuchsia-400 font-mono text-xs font-bold group-hover:translate-x-1 transition-transform">
                  <span>{isAm ? 'የሴት ጓደኞችን እይ' : 'Select Girlfriend'}</span>
                  <span>→</span>
                </div>
              </div>

              {/* Option B: Boyfriend */}
              <div
                onClick={() => handleSelectCategory('male')}
                className="group relative border-2 border-slate-800 hover:border-cyan-500 bg-slate-900/90 p-6 cursor-pointer transition-all duration-300 hover:scale-[1.03] shadow-2xl overflow-hidden flex flex-col justify-between "
              >
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-600/20 blur-2xl group-hover:bg-cyan-600/35 transition-all" />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl p-3 bg-cyan-950/60 border border-cyan-800/80  inline-block">
                      M
                    </span>
                    <span className="font-mono text-xs font-bold px-2.5 py-1  bg-cyan-950 border border-cyan-700 text-cyan-300">
                      {boyfriends.length} {isAm ? 'ጓደኞች' : 'Profiles'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-mono text-xl font-black text-white group-hover:text-cyan-300 transition-colors">
                      {isAm ? 'የወንድ ጓደኛ ፈልግ' : 'Find a Boyfriend'}
                    </h3>
                    <p className="font-mono text-xs text-slate-400 mt-1 leading-relaxed">
                      {isAm
                        ? 'ኬንያን (ሲስተምስ)፣ ዮናስ (ረስት ገንቢ) እና አሌክስ (ፉል-ስታክ)'
                        : 'Connect with Kenean, Yonas, or Alex — from distributed systems to Rust architects.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 flex-wrap">
                    {boyfriends.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center gap-1.5 px-2.5 py-1  bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300"
                      >
                        <span>{b.nationality}</span>
                        <span className="font-bold">{b.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-cyan-400 font-mono text-xs font-bold group-hover:translate-x-1 transition-transform">
                  <span>{isAm ? 'የወንድ ጓደኞችን እይ' : 'Select Boyfriend'}</span>
                  <span>→</span>
                </div>
              </div> 
            </div>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════
             LOCKED CHOSEN ROSTER (ONLY the chosen gender, no non-chosen displayed)
             ═══════════════════════════════════════════════════════════════════ */
          <div className="w-full mt-4 animate-fade-in space-y-5">
            {/* Target Status Banner */}
            <div className="w-full flex items-center justify-between p-3  bg-slate-900 border border-slate-800 shadow-md flex-wrap gap-2">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="w-2 h-2  bg-cyan-400 animate-pulse" />
                <span className="text-slate-400">{isAm ? "የተመረጠ:" : "Active Preference:"}</span>
                <span className="font-bold text-white px-2 py-0.5  bg-slate-950 border border-slate-800 text-cyan-300">
                  {activeTarget === 'female'
                    ? (isAm ? 'የሴት ጓደኞች' : 'Girlfriends')
                    : (isAm ? 'የወንድ ጓደኞች ' : 'Boyfriends')}
                </span>
                <span className="text-slate-500 text-[11px]">
                  ({activeRoster.length} {isAm ? 'ገንቢዎች' : 'soulmates'})
                </span>
              </div>

              <span className="text-[11px] text-slate-500 font-mono">
                {isAm ? "ምርጫን ለመቀየር በ Settings ⚙️ ውስጥ ይቀይሩ" : "To change preference, edit in Settings ⚙️"}
              </span>
            </div>

            {/* Character Cards Grid (Strictly chosen gender only!) */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeRoster.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  charState={allCharStates[character.id] ?? { mood: character.defaultMood ?? "curious", relationship: character.initialRelationship ?? 15 }}
                  onSelect={() => handleCardClick(character)}
                  t={t}
                  lang={lang}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}