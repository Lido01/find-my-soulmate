// Commit: feat(character): add CharacterSelectScreen full-page selection UI

import CharacterCard from "./CharacterCard.jsx";

export default function CharacterSelectScreen({ allCharacters = [], allCharStates = {}, onSelect, t, lang = "en" }) {
  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col overflow-hidden">
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

      <div className="relative z-20 flex flex-col flex-1 items-center px-4 pt-12 pb-8">
        {/* System Online badge */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 rounded-full px-3 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs text-emerald-400 tracking-widest">SYSTEM ONLINE</span>
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
            <p className="font-mono text-xl text-fuchsia-300 mt-1 tracking-widest opacity-80">
              ነፍስ_ጓደኛዬን_አግኝ
            </p>
          )}
        </div>

        {/* Tagline */}
        <p className="font-mono text-slate-400 text-sm mb-1">{t?.tagline ?? "// where devs fall in love"}</p>
        <p className="font-mono text-slate-600 text-xs mb-10">{t?.selectSubtext ?? "choose your partner to begin"}</p>

        {/* Character cards grid */}
        <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
          {allCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              charState={allCharStates[character.id] ?? { mood: "neutral", relationship: 0 }}
              onSelect={onSelect}
              t={t}
              lang={lang}
            />
          ))}
        </div>

        {/* Bottom hint */}
        <p className="font-mono text-xs text-slate-700 mt-10 tracking-widest animate-pulse">
          {t?.selectHint ?? "// click a character to open a channel"}
        </p>
      </div>
    </div>
  );
}
