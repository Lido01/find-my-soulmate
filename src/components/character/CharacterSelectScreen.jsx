// ─────────────────────────────────────────────────────────────────────────────
// CharacterSelectScreen.jsx — Strict Category Choice (Girlfriend OR Boyfriend)
// No mixed/both options: selection locks into chosen gender with switcher & about guide.
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
  onOpenAbout,
  onSwitchToRealWs,
  t,
  lang = "en",
}) {
  // 'female' = Girlfriends list | 'male' = Boyfriends list | null = Gate screen
  const [chosenCategory, setChosenCategory] = useState(null);

  // Normalize allCharacters list (handle both Object and Array)
  const charList = Array.isArray(allCharacters) ? allCharacters : Object.values(allCharacters || {});

  const girlfriends = charList.filter((c) => c.gender === 'female');
  const boyfriends = charList.filter((c) => c.gender === 'male');

  // Strictly filter by chosen category (never show both or mixed)
  const activeRoster = chosenCategory === 'female'
    ? girlfriends
    : chosenCategory === 'male'
      ? boyfriends
      : [];

  function handleSelectCategory(cat) {
    soundEngine.playRomanticChime();
    setChosenCategory(cat);
  }

  function handleBackToGate() {
    soundEngine.playHeartbeat();
    setChosenCategory(null);
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
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-fuchsia-900/20  blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-900/20  blur-3xl" />
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
            FIRST PAGE: GATE SCREEN (STRICT CHOICE: Girlfriend OR Boyfriend)
            ═══════════════════════════════════════════════════════════════════ */}
        {chosenCategory === null ? (
          <div className="w-full max-w-3xl mt-6 animate-fade-in space-y-6">
            {/* Exactly 2 Options: Strictly Girlfriend OR Boyfriend */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Option A: Girlfriend */}
              <div
                onClick={() => handleSelectCategory('female')}
                className="group relative  border-2 border-slate-800 hover:border-fuchsia-500 bg-slate-900/90 p-6 cursor-pointer transition-all duration-300 hover:scale-[1.03] shadow-2xl overflow-hidden flex flex-col justify-between"
              >
                {/* Glow accent */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-fuchsia-600/20  blur-2xl group-hover:bg-fuchsia-600/35 transition-all" />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl p-3  bg-fuchsia-950/60 border border-fuchsia-800/80 inline-block">
                      👩‍💻
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

                  {/* Character preview avatars */}
                  <div className="flex items-center gap-2 pt-2">
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
                  <span>{isAm ? 'የሴት ጓደኞችን እይ' : 'Select Looking for a Girlfriend'}</span>
                  <span>→</span>
                </div>
              </div>

              {/* Option B: Boyfriend */}
              <div
                onClick={() => handleSelectCategory('male')}
                className="group relative  border-2 border-slate-800 hover:border-cyan-500 bg-slate-900/90 p-6 cursor-pointer transition-all duration-300 hover:scale-[1.03] shadow-2xl overflow-hidden flex flex-col justify-between"
              >
                {/* Glow accent */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-600/20  blur-2xl group-hover:bg-cyan-600/35 transition-all" />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl p-3  bg-cyan-950/60 border border-cyan-800/80 inline-block">
                      👨‍💻
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
                        ? 'ሊኑስ (ሲ/ከርነል)፣ ዴቮን (CSS አርቲስት) እና ዳዊት (Rust መሃንዲስ)'
                        : 'Connect with Linus, Devon, or Dawit — from low-level systems hackers to frontend architects.'}
                    </p>
                  </div>

                  {/* Character preview avatars */}
                  <div className="flex items-center gap-2 pt-2">
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
                  <span>{isAm ? 'የወንድ ጓደኞችን እይ' : 'Select Looking for a Boyfriend'}</span>
                  <span>→</span>
                </div>
              </div> 
            </div>

          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════
             SECOND PAGE: DEDICATED ROSTER (Strictly the chosen gender only!)
             ═══════════════════════════════════════════════════════════════════ */
          <div className="w-full mt-2 animate-fade-in space-y-6">
            {/* Navigation back to Gate & Gender Switcher */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 p-3  border border-slate-800 shadow-lg">
              <button
                type="button"
                onClick={handleBackToGate}
                className="font-mono text-xs text-slate-400 hover:text-white px-3 py-1.5  border border-slate-800 hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <span>←</span>
                <span>{isAm ? 'ተመለስ' : '← Back'}</span>
              </button>

              {/* Dedicated Gender Indicator & Switcher */}
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1.5  border font-mono text-xs font-bold flex items-center gap-1.5 ${
                  chosenCategory === 'female'
                    ? 'bg-fuchsia-950 border-fuchsia-700 text-fuchsia-300'
                    : 'bg-cyan-950 border-cyan-700 text-cyan-300'
                }`}>
                  <span>
                    {chosenCategory === 'female'
                      ? (isAm ? 'የሴት ጓደኞች ዝርዝር (3)' : 'Girlfriends Active (3)')
                      : (isAm ? 'የወንድ ጓደኞች ዝርዝር (3)' : 'Boyfriends Active (3)')}
                  </span>
                </div>

                {/* Direct button to switch to other gender */}
                <button
                  type="button"
                  onClick={() => handleSelectCategory(chosenCategory === 'female' ? 'male' : 'female')}
                  className="font-mono text-xs text-slate-400 hover:text-white px-3 py-1.5  border border-slate-800 hover:border-slate-600 bg-slate-950 flex items-center gap-1.5 transition-colors"
                  title="Switch gender focus"
                >
                  <span>
                    {chosenCategory === 'female'
                      ? (isAm ? 'ወደ ወንድ ጓደኞች ቀይር' : 'Switch to BF 👨‍💻')
                      : (isAm ? 'ወደ ሴት ጓደኞች ቀይር' : 'Switch to GF 👩‍💻')}
                  </span>
                </button>
              </div>
            </div>

            {/* Character Cards Grid (Strictly chosen gender only!) */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeRoster.map((character) => (
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
          </div>
        )}
      </div>
    </div>
  );
}
