// ─────────────────────────────────────────────────────────────────────────────
// CharacterSelectScreen.jsx — Category Choice Gate First, then Roster
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
  // null = first gate screen (must choose Girlfriend or Boyfriend first)
  // 'female' = Girlfriends list
  // 'male' = Boyfriends list
  // 'all' = All list
  const [chosenCategory, setChosenCategory] = useState(null);

  // Support both Object and Array
  const charList = Array.isArray(allCharacters) ? allCharacters : Object.values(allCharacters || {});

  const girlfriends = charList.filter((c) => c.gender === 'female');
  const boyfriends = charList.filter((c) => c.gender === 'male');

  const activeRoster = charList.filter((c) => {
    if (chosenCategory === 'female') return c.gender === 'female';
    if (chosenCategory === 'male') return c.gender === 'male';
    return true; // 'all'
  });

  function handleSelectCategory(cat) {
    soundEngine.playRomanticChime();
    setChosenCategory(cat);
  }

  function handleBackToGate() {
    soundEngine.playHeartbeat();
    setChosenCategory(null);
  }

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

      <div className="relative z-20 flex flex-col flex-1 items-center px-4 pt-6 pb-12 max-w-5xl mx-auto w-full">
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
        <div className="text-center mb-2">
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

        {/* ═══════════════════════════════════════════════════════════════════
            FIRST PAGE: GATE SCREEN (Choose Girlfriend or Boyfriend First!)
            ═══════════════════════════════════════════════════════════════════ */}
        {chosenCategory === null ? (
          <div className="w-full max-w-3xl mt-6 animate-fade-in space-y-6">
            <div className="text-center space-y-1">
              <span className="font-mono text-xs text-fuchsia-400 font-bold uppercase tracking-widest">
                [ Step 1: Choose Your Path ]
              </span>
              <h2 className="font-mono text-2xl font-black text-white">
                {lang === 'am' ? 'ማንን ማግኘት ይፈልጋሉ?' : 'Who are you looking to connect with?'}
              </h2>
              <p className="font-mono text-xs text-slate-500">
                {lang === 'am'
                  ? 'መጀመሪያ ምርጫዎን ይምረጡ — ዝርዝሩ ወዲያው ይቀርብልዎታል'
                  : 'Select your preferred match to reveal tailored soulmate profiles'}
              </p>
            </div>

            {/* 2 Big Gateway Choice Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Option A: Girlfriend */}
              <div
                onClick={() => handleSelectCategory('female')}
                className="group relative rounded-3xl border-2 border-slate-800 hover:border-fuchsia-500 bg-slate-900/90 p-6 cursor-pointer transition-all duration-300 hover:scale-[1.03] shadow-2xl overflow-hidden flex flex-col justify-between"
              >
                {/* Glow accent */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-fuchsia-600/20 rounded-full blur-2xl group-hover:bg-fuchsia-600/35 transition-all" />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl p-3 rounded-2xl bg-fuchsia-950/60 border border-fuchsia-800/80 inline-block">
                      👩‍💻
                    </span>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-fuchsia-950 border border-fuchsia-700 text-fuchsia-300">
                      {girlfriends.length} {lang === 'am' ? 'ጓደኞች' : 'Profiles'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-mono text-xl font-black text-white group-hover:text-fuchsia-300 transition-colors">
                      {lang === 'am' ? 'የሴት ጓደኛ ፈልግ' : 'Find a Girlfriend'}
                    </h3>
                    <p className="font-mono text-xs text-slate-400 mt-1 leading-relaxed">
                      {lang === 'am'
                        ? 'ሊና (ከርነል ጠባቂ)፣ ዳኒ (ፊት-ኤንድ) እና ሰናይት (AI መሃንዲስ)'
                        : 'Connect with Lina, Dani, or Senait — from Linux kernel maintainers to AI researchers.'}
                    </p>
                  </div>

                  {/* Character preview avatars */}
                  <div className="flex items-center gap-2 pt-2">
                    {girlfriends.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300"
                      >
                        <span>{g.nationality}</span>
                        <span className="font-bold">{g.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-fuchsia-400 font-mono text-xs font-bold group-hover:translate-x-1 transition-transform">
                  <span>{lang === 'am' ? 'የሴት ጓደኞችን እይ' : 'Browse Girlfriends'}</span>
                  <span>→</span>
                </div>
              </div>

              {/* Option B: Boyfriend */}
              <div
                onClick={() => handleSelectCategory('male')}
                className="group relative rounded-3xl border-2 border-slate-800 hover:border-cyan-500 bg-slate-900/90 p-6 cursor-pointer transition-all duration-300 hover:scale-[1.03] shadow-2xl overflow-hidden flex flex-col justify-between"
              >
                {/* Glow accent */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-600/20 rounded-full blur-2xl group-hover:bg-cyan-600/35 transition-all" />

                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl p-3 rounded-2xl bg-cyan-950/60 border border-cyan-800/80 inline-block">
                      👨‍💻
                    </span>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300">
                      {boyfriends.length} {lang === 'am' ? 'ጓደኞች' : 'Profiles'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-mono text-xl font-black text-white group-hover:text-cyan-300 transition-colors">
                      {lang === 'am' ? 'የወንድ ጓደኛ ፈልግ' : 'Find a Boyfriend'}
                    </h3>
                    <p className="font-mono text-xs text-slate-400 mt-1 leading-relaxed">
                      {lang === 'am'
                        ? 'ሊኑስ (ሲ/ከርነል)፣ ዴቮን (CSS አርቲስት) እና ዳዊት (Rust መሃንዲስ)'
                        : 'Connect with Linus, Devon, or Dawit — from low-level systems hackers to frontend architects.'}
                    </p>
                  </div>

                  {/* Character preview avatars */}
                  <div className="flex items-center gap-2 pt-2">
                    {boyfriends.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300"
                      >
                        <span>{b.nationality}</span>
                        <span className="font-bold">{b.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between text-cyan-400 font-mono text-xs font-bold group-hover:translate-x-1 transition-transform">
                  <span>{lang === 'am' ? 'የወንድ ጓደኞችን እይ' : 'Browse Boyfriends'}</span>
                  <span>→</span>
                </div>
              </div>
            </div>

            {/* Option C: Explore Everyone */}
            <div
              onClick={() => handleSelectCategory('all')}
              className="p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/80 bg-slate-900/60 hover:bg-slate-900 cursor-pointer transition-all flex items-center justify-between font-mono text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">💖</span>
                <div>
                  <span className="text-slate-200 font-bold">
                    {lang === 'am' ? 'ሁሉንም 6 የነፍስ ጓደኞች በአንድ ላይ እይ' : 'Open to everyone? Explore all 6 soulmates'}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {lang === 'am' ? 'ሙሉውን ዝርዝር በአንድ ጊዜ ለመቃኘት' : 'Browse both girlfriends and boyfriends side-by-side'}
                  </p>
                </div>
              </div>
              <span className="text-emerald-400 font-bold px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/80">
                {lang === 'am' ? 'ሁሉንም እይ' : 'View All'} ({charList.length}) →
              </span>
            </div>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════════
             SECOND PAGE: TAILORED ROSTER (Shows ONLY after user chooses!)
             ═══════════════════════════════════════════════════════════════════ */
          <div className="w-full mt-4 animate-fade-in space-y-6">
            {/* Navigation back to Gate & Filter Switcher */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shadow-lg">
              <button
                type="button"
                onClick={handleBackToGate}
                className="font-mono text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <span>←</span>
                <span>{lang === 'am' ? 'ወደ ምርጫ መመለሻ' : 'Back to Category Choice'}</span>
              </button>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectCategory('female')}
                  className={`font-mono text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                    chosenCategory === 'female'
                      ? 'bg-fuchsia-950 border border-fuchsia-600 text-fuchsia-300 shadow-md shadow-fuchsia-950/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  👩‍💻 {lang === 'am' ? 'የሴት ጓደኛ' : 'Girlfriends'} ({girlfriends.length})
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectCategory('male')}
                  className={`font-mono text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                    chosenCategory === 'male'
                      ? 'bg-cyan-950 border border-cyan-600 text-cyan-300 shadow-md shadow-cyan-950/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  👨‍💻 {lang === 'am' ? 'የወንድ ጓደኛ' : 'Boyfriends'} ({boyfriends.length})
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectCategory('all')}
                  className={`font-mono text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                    chosenCategory === 'all'
                      ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 shadow-md shadow-emerald-950/50'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  💖 {lang === 'am' ? 'ሁሉንም' : 'All'} ({charList.length})
                </button>
              </div>
            </div>

            {/* Character Cards Grid */}
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

        {/* Bottom hint */}
        <p className="font-mono text-xs text-slate-600 mt-10 tracking-widest text-center">
          // audio voice narration & sound effects active · toggle anytime in settings
        </p>
      </div>
    </div>
  );
}
