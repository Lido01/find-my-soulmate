// ─────────────────────────────────────────────────────────────────────────────
// CharacterSelectScreen.jsx — Strict Category Choice (Girlfriend OR Boyfriend)
// High-tech Red, Black & White developer theme with Space Grotesk / JetBrains Mono
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
    <div className="relative min-h-screen bg-black flex flex-col overflow-y-auto font-mono select-text">
      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)",
        }}
      />

      {/* Ambient background glow: deep cyber crimson */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-950/25 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-zinc-900/30 blur-3xl" />
      </div>

      <div className="relative z-20 flex flex-col flex-1 items-center px-4 pt-8 pb-12 max-w-5xl mx-auto w-full">
        {/* App title */}
        <div className="text-center mb-2">
          <h1 className="font-heading text-4xl md:text-5xl font-black tracking-tight text-white">
            Find<span className="text-red-500">MySoulmate</span>.io
          </h1>
        </div>

        {/* Tagline */}
        <p className="font-mono text-zinc-400 text-xs sm:text-sm mb-2 text-center">
          // Stop debugging alone. Choose your mate instead of hitting a keyboard.
        </p>

        {/* ═══════════════════════════════════════════════════════════════════
            FIRST TIME GATE SCREEN (ONLY SHOWN IF NO CHOICE HAS BEEN MADE YET)
            ═══════════════════════════════════════════════════════════════════ */}
        {activeTarget === null ? (
          <div className="w-full max-w-3xl mt-4 animate-fade-in space-y-6">
            {!userProfile?.isRegistered && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4  border border-zinc-800 bg-zinc-950/90 shadow-xl">
                <div>
                  <p className="font-mono text-[11px] text-red-400 font-bold uppercase tracking-wider">Session Ready</p>
                  <p className="text-sm text-zinc-200 mt-0.5 font-sans">Log in with your Love Code, or register a new developer card.</p>
                </div>
                <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="shrink-0 inline-flex items-center justify-center gap-2   border border-red-600 bg-red-950/60 px-3.5 py-2 text-xs font-bold text-white hover:bg-red-900 transition-all shadow-sm"
                  >
                    <IconLogIn className="w-4 h-4" />
                    Log in with Love Code
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenRegister?.()}
                    className="shrink-0 inline-flex items-center justify-center gap-1   border border-zinc-700 bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-200 hover:text-white hover:border-red-500 transition-all"
                  >
                    Register new profile
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
                className="group relative border-2 border-zinc-800 hover:border-red-600 bg-zinc-950 p-6  cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-2xl overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-red-600/15 blur-2xl group-hover:bg-red-600/30 transition-all" />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl p-3 bg-black border border-zinc-800   inline-block group-hover:border-red-600 transition-colors">
                      👩‍💻
                    </span>
                    <span className="font-mono text-xs font-bold px-2.5 py-1   bg-black border border-zinc-800 text-red-400">
                      {girlfriends.length} {isAm ? 'ጓደኞች' : 'Profiles'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading text-xl font-black text-white group-hover:text-red-400 transition-colors">
                      {isAm ? 'የሴት ጓደኛ ፈልግ' : 'Find a Girlfriend'}
                    </h3>
                    <p className="font-sans text-xs text-zinc-400 mt-1 leading-relaxed">
                      {isAm
                        ? 'ሊና (ከርነል ጠባቂ)፣ ዳኒ (ፊት-ኤንድ) እና ሰናይት (AI መሃንዲስ)'
                        : 'Connect with Lina, Dani, or Senait — from Linux kernel maintainers to PyTorch AI researchers.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 flex-wrap font-mono">
                    {girlfriends.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center gap-1.5 px-2.5 py-1   bg-black border border-zinc-800 text-xs text-zinc-300"
                      >
                        <span>{g.nationality}</span>
                        <span className="font-bold">{g.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 mt-6 pt-3 border-t border-zinc-800 flex items-center justify-between text-red-400 font-mono text-xs font-bold group-hover:translate-x-1 transition-transform">
                  <span>{isAm ? 'የሴት ጓደኞችን እይ' : 'Select Girlfriend'}</span>
                  <span>→</span>
                </div>
              </div>

              {/* Option B: Boyfriend */}
              <div
                onClick={() => handleSelectCategory('male')}
                className="group relative border-2 border-zinc-800 hover:border-red-600 bg-zinc-950 p-6  cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-2xl overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-zinc-800/30 blur-2xl group-hover:bg-red-600/20 transition-all" />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl p-3 bg-black border border-zinc-800   inline-block group-hover:border-red-600 transition-colors">
                      👨‍💻
                    </span>
                    <span className="font-mono text-xs font-bold px-2.5 py-1   bg-black border border-zinc-800 text-white">
                      {boyfriends.length} {isAm ? 'ጓደኞች' : 'Profiles'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading text-xl font-black text-white group-hover:text-red-400 transition-colors">
                      {isAm ? 'የወንድ ጓደኛ ፈልግ' : 'Find a Boyfriend'}
                    </h3>
                    <p className="font-sans text-xs text-zinc-400 mt-1 leading-relaxed">
                      {isAm
                        ? 'ሊኑስ (ሲስተምስ)፣ ዴቮን (UI አርቲስት) እና ዳዊት (ረስት ገንቢ)'
                        : 'Connect with Linus, Devon, or Dawit — from distributed systems architects to Three.js designers.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 flex-wrap font-mono">
                    {boyfriends.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center gap-1.5 px-2.5 py-1   bg-black border border-zinc-800 text-xs text-zinc-300"
                      >
                        <span>{b.nationality}</span>
                        <span className="font-bold">{b.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 mt-6 pt-3 border-t border-zinc-800 flex items-center justify-between text-white font-mono text-xs font-bold group-hover:translate-x-1 transition-transform">
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
            <div className="w-full flex items-center justify-between p-3   bg-zinc-950 border border-zinc-800 shadow-md flex-wrap gap-2">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-zinc-400">{isAm ? "የተመረጠ:" : "Active Preference:"}</span>
                <span className="font-bold text-white px-2.5 py-0.5   bg-black border border-zinc-800">
                  {activeTarget === 'female'
                    ? (isAm ? 'የሴት ጓደኞች' : 'Girlfriends')
                    : (isAm ? 'የወንድ ጓደኞች ' : 'Boyfriends')}
                </span>
                <span className="text-zinc-500 text-[11px]">
                  ({activeRoster.length} {isAm ? 'ገንቢዎች' : 'soulmates'})
                </span>
              </div>

              <span className="text-[11px] text-zinc-500 font-mono">
                {isAm ? "ምርጫን ለመቀየር በ Settings ውስጥ ይቀይሩ" : "To change preference, edit in Settings"}
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
