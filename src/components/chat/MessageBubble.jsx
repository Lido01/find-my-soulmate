// ─────────────────────────────────────────────────────────────────────────────
// MessageBubble.jsx — Partner Voice Audio Playback, Gift Badges, and Player Chat
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { RARITY_META } from '../../data/gifts.js';
import { IconGift, IconStar } from '../ui/Icons.jsx';
import { soundEngine } from '../../utils/audio.js';

function formatTimestamp(ts) {
  if (!ts) return "";
  const d = ts instanceof Date ? ts : new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function GiftBadge({ message, lang = "en" }) {
  const gift = message.gift || {};
  const rarityKey = gift.rarity || message.rarity || "common";
  const rarity = RARITY_META?.[rarityKey] ?? { label: rarityKey, color: "#64748b" };
  const giftIcon = gift.icon || message.giftIcon || "🎁";
  const giftName = (typeof gift.name === "object" ? gift.name[lang] || gift.name.en : gift.name) || message.giftName || "Gift";
  const boost = gift.boost || message.relationshipBoost;

  return (
    <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-2xl p-3 min-w-[200px] shadow-lg">
      <span className="text-3xl shrink-0">{giftIcon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <IconGift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-mono text-xs font-bold text-amber-300 truncate">{giftName}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${rarity.color || 'text-slate-400'}`}>
            {rarity.label}
          </span>
          {boost && (
            <div className="flex items-center gap-1">
              <IconStar className="w-3 h-3 text-fuchsia-400" />
              <span className="font-mono text-[10px] text-fuchsia-300 font-bold">+{boost} bond</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessageBubble({ message, character, userProfile, lang = "en" }) {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const isPlayer = message.sender === "player";
  const isGift = Boolean(message.isGift);

  const initials = character?.avatarInitials || (character?.name
    ? character.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??");

  const timeStr = formatTimestamp(message.timestamp);
  const borderColor = character?.borderColor || "#10b981";

  function handlePlayVoice() {
    if (isPlayingVoice) {
      soundEngine.stopVoice();
      setIsPlayingVoice(false);
      return;
    }

    setIsPlayingVoice(true);
    soundEngine.speakRomanticVoice(message.text, character?.gender || 'female', lang);

    // Reset indicator after reasonable duration
    const approxSec = Math.max(2, Math.min(10, message.text.length * 0.07));
    setTimeout(() => {
      setIsPlayingVoice(false);
    }, approxSec * 1000);
  }

  if (isPlayer) {
    return (
      <div className="flex flex-col items-end gap-1 animate-slide-up px-3">
        <div className="max-w-[85%] sm:max-w-[70%]">
          {isGift ? (
            <GiftBadge message={message} lang={lang} />
          ) : (
            <div className="bg-indigo-950/80 border border-indigo-700/60 rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-md">
              <p className="font-mono text-sm text-slate-100 leading-relaxed whitespace-pre-wrap">{message.text}</p>
            </div>
          )}
          {timeStr && (
            <p className="font-mono text-[10px] text-slate-500 mt-1 text-right">{timeStr}</p>
          )}
        </div>
      </div>
    );
  }

  // Partner message
  return (
    <div className="flex items-start gap-2.5 animate-slide-up px-3 group">
      {/* Character avatar */}
      <div
        className={`w-8 h-8 rounded-xl bg-gradient-to-br ${character?.avatarBg || 'from-slate-800 to-slate-950'} flex items-center justify-center shrink-0 text-xs font-mono font-bold text-white border mt-0.5 shadow`}
        style={{ borderColor: borderColor }}
      >
        {initials}
      </div>

      <div className="max-w-[85%] sm:max-w-[75%]">
        {isGift ? (
          <GiftBadge message={message} lang={lang} />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-md relative">
            {message.isAI && (
              <div className="flex items-center gap-1 mb-1 text-[10px] font-mono text-emerald-400">
                <span>🤖 AI live</span>
              </div>
            )}
            <p className="font-mono text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{message.text}</p>

            {/* Romantic voice listen button */}
            <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePlayVoice}
                className="flex items-center gap-1 text-[10px] font-mono text-slate-500 hover:text-fuchsia-400 transition-colors"
                title="Listen to romantic voice narration"
              >
                <span>{isPlayingVoice ? '⏹️' : '🔊'}</span>
                <span>{isPlayingVoice ? 'Playing voice...' : 'Voice audio'}</span>
                {isPlayingVoice && (
                  <span className="flex items-center gap-0.5 ml-1">
                    <span className="w-1 h-2 bg-fuchsia-400 animate-pulse" />
                    <span className="w-1 h-3.5 bg-fuchsia-400 animate-pulse delay-75" />
                    <span className="w-1 h-2 bg-fuchsia-400 animate-pulse delay-150" />
                  </span>
                )}
              </button>

              {timeStr && (
                <p className="font-mono text-[10px] text-slate-600">{timeStr}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
