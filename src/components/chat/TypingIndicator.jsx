// Commit: feat(chat): add TypingIndicator with bouncing dots and character avatar

export default function TypingIndicator({ character }) {
  if (!character) return null;

  const initials = character.name
    ? character.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="flex items-end gap-2 animate-fade-in px-2 py-1">
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-mono font-bold text-white border"
        style={{
          background: character.avatarBg ?? "linear-gradient(135deg,#334155,#1e293b)",
          borderColor: character.accentColor ?? "#64748b",
        }}
      >
        {initials}
      </div>

      {/* Dots bubble */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="typing-dot w-2 h-2 rounded-full inline-block"
            style={{
              backgroundColor: character.accentColor ?? "#64748b",
              animationDelay: `${i * 0.15}s`,
              animation: "typing-bounce 1s infinite ease-in-out",
            }}
          />
        ))}
      </div>
    </div>
  );
}
