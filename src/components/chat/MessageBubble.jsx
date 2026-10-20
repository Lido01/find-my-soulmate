// Commit: feat(chat): add MessageBubble with player/partner/gift rendering

import { RARITY_META } from "../../data/gifts.js";
import { IconGift, IconStar } from "../ui/Icons.jsx";

function formatTimestamp(ts) {
  if (!ts) return "";
  const d = ts instanceof Date ? ts : new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function GiftBadge({ message }) {
  const rarity = RARITY_META?.[message.rarity] ?? { label: message.rarity ?? "common", color: "#64748b" };
  return (
    <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-600/60 rounded-xl p-3 min-w-[160px]">
      <span className="text-3xl">{message.giftIcon ?? "🎁"}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <IconGift className="w-3 h-3 text-amber-400" />
          <span className="font-mono text-xs font-bold text-amber-300 truncate">{message.giftName ?? "Gift"}</span>
        </div>
        <span
          className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
          style={{ background: `${rarity.color}25`, color: rarity.color, border: `1px solid ${rarity.color}60` }}
        >
          {rarity.label}
        </span>
        {message.relationshipBoost && (
          <div className="flex items-center gap-1 mt-1">
            <IconStar className="w-3 h-3 text-fuchsia-400" />
            <span className="font-mono text-[10px] text-fuchsia-300">+{message.relationshipBoost} bond</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessageBubble({ message, character, playerName }) {
  const isPlayer = message.sender === "player";
  const isGift = message.isGift;

  const initials = character?.name
    ? character.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const timeStr = formatTimestamp(message.timestamp);

  if (isPlayer) {
    return (
      <div className="flex flex-col items-end gap-1 animate-slide-up px-2">
        <div className="max-w-[75%]">
          {isGift ? (
            <GiftBadge message={message} />
          ) : (
            <div className="bg-indigo-900/60 border border-indigo-700/40 rounded-2xl rounded-tr-sm px-4 py-2.5">
              <p className="font-mono text-sm text-slate-100 leading-relaxed whitespace-pre-wrap">{message.text}</p>
            </div>
          )}
          {timeStr && (
            <p className="font-mono text-[10px] text-slate-500 mt-0.5 text-right">{timeStr}</p>
          )}
        </div>
      </div>
    );
  }

  // Partner message
  return (
    <div className="flex items-end gap-2 animate-slide-up px-2">
      {/* Character avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-mono font-bold text-white border"
        style={{
          background: character?.avatarBg ?? "linear-gradient(135deg,#334155,#1e293b)",
          borderColor: character?.accentColor ?? "#64748b",
        }}
      >
        {initials}
      </div>

      <div className="max-w-[75%]">
        {isGift ? (
          <GiftBadge message={message} />
        ) : (
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl rounded-tl-sm px-4 py-2.5">
            <p className="font-mono text-sm text-slate-100 leading-relaxed whitespace-pre-wrap">{message.text}</p>
          </div>
        )}
        {timeStr && (
          <p className="font-mono text-[10px] text-slate-500 mt-0.5">{timeStr}</p>
        )}
      </div>
    </div>
  );
}
