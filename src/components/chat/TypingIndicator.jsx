// Commit: fix(chat): polish TypingIndicator animation and avatar border

export default function TypingIndicator({ character }) {
  if (!character) return null;

  const initials = character.avatarInitials || (character.name
    ? character.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??");

  const borderColor = character.borderColor || "#10b981";

  return (
    <div className="flex items-center gap-2.5 animate-fade-in px-3 py-1">
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl bg-gradient-to-br ${character.avatarBg || 'from-slate-800 to-slate-950'} flex items-center justify-center shrink-0 text-xs font-mono font-bold text-white border shadow`}
        style={{ borderColor: borderColor }}
      >
        {initials}
      </div>

      {/* Dots bubble */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full inline-block animate-pulse"
            style={{
              backgroundColor: borderColor,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
