// Commit: fix(chat): polish ChatFeed with smooth scroll and clean empty state

import MessageBubble from "./MessageBubble.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

function EmptyState({ character, lang }) {
  const initials = character?.avatarInitials || (character?.name
    ? character.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??");

  const borderColor = character?.borderColor || "#10b981";

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 py-16 select-none">
      <div
        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${character?.avatarBg || 'from-slate-800 to-slate-950'} flex items-center justify-center text-2xl font-mono font-black text-white border-2 shadow-xl`}
        style={{
          borderColor: borderColor,
          boxShadow: `0 0 24px ${borderColor}50`,
        }}
      >
        {initials}
      </div>
      <div className="text-center space-y-1">
        <p className={`font-mono font-bold text-base ${character?.textClass || 'text-white'}`}>
          {character?.name ?? "..."}
        </p>
        <p className="font-mono text-xs text-slate-500 tracking-widest animate-pulse">
          // channel open... send a message or choose a prompt below
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
        <EmptyState character={character} lang={lang} />
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
