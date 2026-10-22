// ─────────────────────────────────────────────────────────────────────────────
// MessageBubble.jsx — Partner Voice Audio, Player Voice Notes, Gifts & Text Copy
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
    <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-2xl p-3 min-w-[200px] shadow-lg select-text">
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
  const [copied, setCopied] = useState(false);

  const isPlayer = message.sender === "player";
  const isGift = Boolean(message.isGift);
  const isAudio = Boolean(message.isAudio);

  const initials = character?.avatarInitials || (character?.name
    ? character.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??");

  const timeStr = formatTimestamp(message.timestamp);
  const borderColor = character?.borderColor || "#10b981";

  function handleCopy() {
    if (!message?.text) return;
    navigator.clipboard?.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePlayVoice(gender) {
    if (isPlayingVoice) {
      soundEngine.stopVoice();
      setIsPlayingVoice(false);
      return;
    }

    setIsPlayingVoice(true);
    soundEngine.speakRomanticVoice(
      message.text,
      gender || (isPlayer ? (userProfile?.gender || 'male') : (character?.gender || 'female')),
      lang,
      () => setIsPlayingVoice(false)
    );

    // Safety timeout in case onEnd doesn't fire
    const approxSec = Math.max(3, Math.min(12, message.text.length * 0.08));
    setTimeout(() => {
      setIsPlayingVoice(false);
    }, approxSec * 1000);
  }

  if (isPlayer) {
    return (
      <div className="flex flex-col items-end gap-1 animate-slide-up px-3 group">
        <div className="max-w-[88%] sm:max-w-[75%]">
          {isGift ? (
            <GiftBadge message={message} lang={lang} />
          ) : isAudio ? (
            /* Player Voice Audio Note */
            <div className="bg-indigo-950 border border-indigo-600/80 rounded-2xl rounded-tr-sm p-3 shadow-lg space-y-2 select-text">
              <div className="flex items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-indigo-300">
                  <span className="p-1.5 rounded-lg bg-indigo-900/80 border border-indigo-700 text-sm">
                    🎙️
                  </span>
                  <div>
                    <span className="font-bold">Voice Note</span>
                    <span className="text-[10px] text-indigo-400 block">
                      0:0{message.audioDuration || 3}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-2 py-1 rounded-lg bg-indigo-900/80 hover:bg-indigo-800 text-[10px] text-indigo-300 font-mono transition-all"
                    title="Copy voice transcript"
                  >
                    {copied ? '✓ Copied' : '📋 Copy'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlayVoice(userProfile?.gender || 'male')}
                    className="px-2.5 py-1 rounded-lg bg-indigo-900 hover:bg-indigo-800 border border-indigo-600 text-[11px] font-bold text-indigo-200 flex items-center gap-1 transition-all"
                  >
                    <span>{isPlayingVoice ? '⏹' : '▶'}</span>
                    <span>{isPlayingVoice ? 'Stop' : 'Play'}</span>
                  </button>
                </div>
              </div>

              {/* Sound waves animation */}
              <div className="flex items-center gap-1 h-4 px-1">
                {[12, 20, 16, 24, 18, 14, 22, 10, 18, 24, 14, 19, 11].map((h, idx) => (
                  <span
                    key={idx}
                    className={`flex-1 rounded-full transition-all ${
                      isPlayingVoice
                        ? 'bg-cyan-400 animate-pulse'
                        : 'bg-indigo-700/60'
                    }`}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>

              {/* Transcript text */}
              <p className="font-mono text-xs text-indigo-100/90 italic pl-1 select-text cursor-text">
                "{message.text}"
              </p>
            </div>
          ) : (
            <div className="bg-indigo-950/80 border border-indigo-700/60 rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-md relative group/bubble">
              <p className="font-mono text-sm text-slate-100 leading-relaxed whitespace-pre-wrap select-text cursor-text">
                {message.text}
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100"
              title="Copy message"
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
            {timeStr && (
              <p className="font-mono text-[10px] text-slate-500">{timeStr}</p>
            )}
          </div>
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

      <div className="max-w-[88%] sm:max-w-[78%]">
        {isGift ? (
          <GiftBadge message={message} lang={lang} />
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-md relative">
            {message.isAI && (
              <div className="flex items-center gap-1 mb-1 text-[10px] font-mono text-emerald-400">
                <span>🤖 AI live</span>
              </div>
            )}
            <p className="font-mono text-sm text-slate-200 leading-relaxed whitespace-pre-wrap select-text cursor-text">
              {message.text}
            </p>

            {/* Bottom action row: Listen voice & Copy */}
            <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handlePlayVoice(character?.gender || 'female')}
                className={`flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-lg border transition-all ${
                  isPlayingVoice
                    ? 'bg-fuchsia-950 border-fuchsia-600 text-fuchsia-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-fuchsia-300 hover:border-slate-700'
                }`}
                title="Listen to romantic voice narration"
              >
                <span>{isPlayingVoice ? '⏹️' : '🔊'}</span>
                <span>{isPlayingVoice ? 'Playing...' : 'Voice audio'}</span>
                {isPlayingVoice && (
                  <span className="flex items-center gap-0.5 ml-1">
                    <span className="w-1 h-2 bg-fuchsia-400 animate-pulse" />
                    <span className="w-1 h-3.5 bg-fuchsia-400 animate-pulse delay-75" />
                    <span className="w-1 h-2 bg-fuchsia-400 animate-pulse delay-150" />
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-0.5"
                  title="Copy message"
                >
                  <span>{copied ? '✓' : '📋'}</span>
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {timeStr && (
                  <p className="font-mono text-[10px] text-slate-600">{timeStr}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
