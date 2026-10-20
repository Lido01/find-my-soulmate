// Commit: feat(chat): add ChatFeed scrollable message list with empty state

import MessageBubble from "./MessageBubble.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

function EmptyState({ character }) {
  const initials = character?.name
    ? character.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 py-12 select-none">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-mono font-bold text-white border-2"
        style={{
          background: character?.avatarBg ?? "linear-gradient(135deg,#334155,#1e293b)",
          borderColor: character?.accentColor ?? "#64748b",
          boxShadow: `0 0 20px ${character?.accentColor ?? "#64748b"}40`,
        }}
      >
        {initials}
      </div>
      <div className="text-center space-y-1">
        <p className="font-mono text-slate-300 font-bold">{character?.name ?? "..."}</p>
        <p className="font-mono text-xs text-slate-500 tracking-widest animate-pulse">
          // channel open...
        </p>
      </div>
    </div>
  );
}

export default function ChatFeed({ messages = [], character, isTyping, feedRef, lang }) {
  const hasMessages = messages.length > 0;

  return (
    <div
      ref={feedRef}
      className="flex-1 overflow-y-auto flex flex-col gap-3 py-4 scroll-smooth"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}
    >
      {!hasMessages ? (
        <EmptyState character={character} />
      ) : (
        <>
          {messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id ?? idx}
              message={msg}
              character={character}
              lang={lang}
            />
          ))}
          {isTyping && <TypingIndicator character={character} />}
        </>
      )}
    </div>
  );
}
