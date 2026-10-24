// ─────────────────────────────────────────────────────────────────────────────
// TypingIndicator.jsx — High-tech Red, Black & White typing animation
// ─────────────────────────────────────────────────────────────────────────────

export default function TypingIndicator({ character }) {
  if (!character) return null;

  const initials = character.avatarInitials || (character.name
    ? character.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??");

  return (
    <div className="flex items-center gap-2.5 animate-fade-in px-3 py-1 font-mono">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shrink-0 text-xs font-mono font-bold text-white border border-red-600 shadow">
        {initials}
      </div>

      {/* Dots bubble */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full inline-block bg-red-500 animate-pulse"
            style={{
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
