// ─────────────────────────────────────────────────────────────────────────────
// ChatFeed.jsx — Clean Developer Message Feed with Smooth Scroll & Empty State
// High-tech Red, Black & White developer theme with Space Grotesk / JetBrains Mono
// ─────────────────────────────────────────────────────────────────────────────

import MessageBubble from "./MessageBubble.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

function EmptyState({ character, lang }) {
  const initials = character?.avatarInitials || (character?.name
    ? character.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??");

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 py-16 select-none font-mono">
      <div className="w-16 h-16 rounded-2xl bg-black border-2 border-red-600 flex items-center justify-center text-2xl font-mono font-black text-white shadow-xl shadow-red-950/40">
        {initials}
      </div>
      <div className="text-center space-y-1">
        <p className="font-mono font-bold text-base text-white">
          {character?.name ?? "Developer"}
        </p>
        <p className="font-mono text-xs text-red-400 tracking-widest animate-pulse font-bold">
          // channel open... send a message, code snippet, or prompt below
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
      className="flex-1 overflow-y-auto flex flex-col gap-3 py-4 scroll-smooth bg-black font-mono select-text"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#27272a transparent" }}
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
