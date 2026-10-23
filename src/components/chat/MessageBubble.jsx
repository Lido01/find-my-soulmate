// ─────────────────────────────────────────────────────────────────────────────
// MessageBubble.jsx — Partner Voice Audio, Photos, Code Snippets & Telegram Look
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react';
import { RARITY_META } from '../../data/gifts.js';
import { IconGift, IconStar, IconCheck } from '../ui/Icons.jsx';
import { soundEngine } from '../../utils/audio.js';

function formatTimestamp(ts) {
  if (!ts) return "";
  const d = ts instanceof Date ? ts : new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function QuotedReply({ replyTo }) {
  if (!replyTo) return null;
  return (
    <div className="mb-2 pl-2.5 py-1 pr-2 border-l-2 border-cyan-400 bg-slate-950/80 rounded-r-lg text-[11px] font-mono select-none shadow-inner">
      <span className="font-bold text-cyan-300 block truncate">{replyTo.senderName || 'Developer'}</span>
      <p className="text-slate-400 truncate text-[10px] mt-0.5">{replyTo.text || 'Attachment'}</p>
    </div>
  );
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

export default function MessageBubble({ message, character, userProfile, onReply, lang = "en" }) {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const audioRef = useRef(null);

  const isPlayer = message.sender === "player";
  const isGift = Boolean(message.isGift);
  const isAudio = Boolean(message.isAudio);
  const isImage = Boolean(message.isImage && message.imageUrl);
  const isCode = Boolean(message.isCode);

  const partnerAvatarUrl = character?.avatarUrl || message.senderAvatarUrl || null;
  const partnerInitials = character?.avatarInitials || (character?.name
    ? character.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??");

  const timeStr = formatTimestamp(message.timestamp);
  const borderColor = character?.borderColor || "#06b6d4";

  function handleCopy() {
    if (!message?.text) return;
    navigator.clipboard?.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePlayVoice(gender) {
    if (message.audioUrl) {
      if (isPlayingVoice) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setIsPlayingVoice(false);
      } else {
        if (audioRef.current) {
          audioRef.current.play().then(() => {
            setIsPlayingVoice(true);
          }).catch(() => {
            setIsPlayingVoice(false);
          });
        }
      }
      return;
    }

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

    const approxSec = Math.max(3, Math.min(12, message.text.length * 0.08));
    setTimeout(() => {
      setIsPlayingVoice(false);
    }, approxSec * 1000);
  }

  // ── PLAYER MESSAGE (RIGHT ALIGNED) ─────────────────────────────────────────
  if (isPlayer) {
    return (
      <div className="flex flex-col items-end gap-1 animate-slide-up px-2 sm:px-3 group">
        <div className="max-w-[90%] sm:max-w-[75%]">
          {message.audioUrl && (
            <audio
              ref={audioRef}
              src={message.audioUrl}
              onEnded={() => setIsPlayingVoice(false)}
              onError={() => setIsPlayingVoice(false)}
              className="hidden"
            />
          )}

          {isGift ? (
            <GiftBadge message={message} lang={lang} />
          ) : isAudio ? (
            /* Voice Audio Note */
            <div className="bg-cyan-950/90 border border-cyan-700/80 rounded-2xl rounded-tr-xs p-3 shadow-md space-y-2 select-text">
              <QuotedReply replyTo={message.replyTo} />
              <div className="flex items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center gap-2 text-cyan-300">
                  <span className="p-1.5 rounded-lg bg-cyan-900/80 border border-cyan-600 text-sm">
                    🎙️
                  </span>
                  <div>
                    <span className="font-bold">{message.audioUrl ? 'Real Voice Note' : 'Voice Note'}</span>
                    <span className="text-[10px] text-cyan-400 block">
                      0:0{message.audioDuration || 3}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePlayVoice(userProfile?.gender || 'male')}
                    className="px-2.5 py-1 rounded-lg bg-cyan-900 hover:bg-cyan-800 border border-cyan-600 text-[11px] font-bold text-cyan-200 flex items-center gap-1 transition-all"
                  >
                    <span>{isPlayingVoice ? '⏹' : '▶'}</span>
                    <span>{isPlayingVoice ? 'Stop' : 'Play'}</span>
                  </button>
                </div>
              </div>

              {/* Sound waves animation */}
              <div className="flex items-center gap-1 h-3.5 px-1">
                {[10, 18, 14, 22, 16, 12, 20, 8, 16, 22, 12, 18, 9].map((h, idx) => (
                  <span
                    key={idx}
                    className={`flex-1 rounded-full transition-all ${
                      isPlayingVoice ? 'bg-cyan-300 animate-pulse' : 'bg-cyan-700/60'
                    }`}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>

              {message.text && (
                <p className="font-mono text-xs text-cyan-100/90 italic pl-1 select-text">
                  "{message.text}"
                </p>
              )}
            </div>
          ) : isImage ? (
            /* Image / Asset Attachment (Telegram Style) */
            <div className="bg-cyan-950/90 border border-cyan-700/80 rounded-2xl rounded-tr-xs p-1.5 shadow-md space-y-1.5 overflow-hidden">
              <QuotedReply replyTo={message.replyTo} />
              <div 
                className="rounded-xl overflow-hidden cursor-pointer hover:opacity-95 transition-opacity max-h-64 bg-slate-950 flex items-center justify-center"
                onClick={() => setShowImageModal(true)}
              >
                <img src={message.imageUrl} alt="Asset" className="max-h-64 w-auto object-cover rounded-lg" />
              </div>
              {message.text && message.text !== 'Shared a photo 📷' && (
                <p className="px-2 py-1 font-mono text-xs text-cyan-100 whitespace-pre-wrap select-text">
                  {message.text}
                </p>
              )}
            </div>
          ) : isCode ? (
            /* Code Snippet Attachment */
            <div className="bg-slate-900 border border-cyan-700/80 rounded-2xl rounded-tr-xs p-3 shadow-md space-y-1.5 max-w-full overflow-hidden">
              <QuotedReply replyTo={message.replyTo} />
              <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold pb-1 border-b border-slate-800">
                <span>💻 {message.codeLang || 'Code'}</span>
                <button onClick={handleCopy} className="text-slate-400 hover:text-white">
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <pre className="font-mono text-xs text-cyan-200 overflow-x-auto p-2 rounded bg-slate-950 border border-slate-800/80">
                <code>{message.text}</code>
              </pre>
            </div>
          ) : (
            /* Standard Text Bubble */
            <div className="bg-cyan-950/90 border border-cyan-700/70 rounded-2xl rounded-tr-xs px-3.5 py-2 shadow-md relative group/bubble">
              <QuotedReply replyTo={message.replyTo} />
              <p className="font-mono text-xs sm:text-sm text-cyan-50 leading-relaxed whitespace-pre-wrap select-text cursor-text">
                {message.text}
              </p>
            </div>
          )}

          {/* Timestamp, Reply CTA, & Read Receipt */}
          <div className="flex items-center justify-end gap-1.5 mt-0.5 pr-1">
            {onReply && (
              <button
                type="button"
                onClick={() => onReply(message)}
                className="text-[10px] font-mono text-slate-500 hover:text-cyan-300 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-0.5"
                title="Reply to message"
              >
                <span>↩️</span>
                <span>Reply</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100"
              title="Copy message"
            >
              {copied ? '✓' : 'Copy'}
            </button>
            {timeStr && (
              <span className="font-mono text-[10px] text-slate-500">{timeStr}</span>
            )}

            {/* Read Receipt */}
            {message.status === 'seen' ? (
              <span className="text-[11px] text-cyan-400 flex items-center gap-0.5 font-bold tracking-tighter" title="Seen by partner">
                <span>✓✓</span>
                <span className="text-[9px] uppercase font-mono">Seen</span>
              </span>
            ) : message.status === 'delivered' ? (
              <span className="text-[11px] text-slate-400 flex items-center font-bold tracking-tighter" title="Delivered">
                ✓✓
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 flex items-center font-bold" title="Sent">
                ✓
              </span>
            )}
          </div>
        </div>

        {/* Lightbox Image Preview Modal */}
        {showImageModal && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowImageModal(false)}
          >
            <div className="relative max-w-2xl max-h-[90vh] flex flex-col items-center">
              <img src={message.imageUrl} alt="Full view" className="max-h-[80vh] w-auto rounded-2xl shadow-2xl border border-slate-800 object-contain" />
              <button
                onClick={() => setShowImageModal(false)}
                className="mt-3 px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold"
              >
                Close ✕
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── PARTNER MESSAGE (LEFT ALIGNED) ──────────────────────────────────────────
  return (
    <div className="flex items-start gap-2 sm:gap-2.5 animate-slide-up px-2 sm:px-3 group">
      {/* Partner Avatar Photo or Initials */}
      <div
        className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border mt-0.5 shadow flex items-center justify-center bg-slate-900 text-xs font-mono font-bold text-white"
        style={{ borderColor: borderColor }}
      >
        {partnerAvatarUrl ? (
          <img src={partnerAvatarUrl} alt={character?.name || 'Partner'} className="w-full h-full object-cover" />
        ) : character?.emoji ? (
          <span className="text-base">{character.emoji}</span>
        ) : (
          partnerInitials
        )}
      </div>

      <div className="max-w-[90%] sm:max-w-[78%]">
        {message.audioUrl && (
          <audio
            ref={audioRef}
            src={message.audioUrl}
            onEnded={() => setIsPlayingVoice(false)}
            onError={() => setIsPlayingVoice(false)}
            className="hidden"
          />
        )}

        {isGift ? (
          <GiftBadge message={message} lang={lang} />
        ) : isAudio ? (
          /* Partner Voice Note */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-xs p-3 shadow-md space-y-2 select-text">
            <QuotedReply replyTo={message.replyTo} />
            <div className="flex items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-cyan-300">
                <span className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sm">
                  🎙️
                </span>
                <div>
                  <span className="font-bold text-white">{message.audioUrl ? 'Real Voice Note' : 'Voice Note'}</span>
                  <span className="text-[10px] text-slate-400 block">
                    0:0{message.audioDuration || 3}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePlayVoice(character?.gender || 'female')}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-[11px] font-bold text-cyan-200 flex items-center gap-1 transition-all"
                >
                  <span>{isPlayingVoice ? '⏹' : '▶'}</span>
                  <span>{isPlayingVoice ? 'Stop' : 'Play'}</span>
                </button>
              </div>
            </div>

            {/* Sound waves animation */}
            <div className="flex items-center gap-1 h-3.5 px-1">
              {[10, 18, 14, 22, 16, 12, 20, 8, 16, 22, 12, 18, 9].map((h, idx) => (
                <span
                  key={idx}
                  className={`flex-1 rounded-full transition-all ${
                    isPlayingVoice ? 'bg-cyan-400 animate-pulse' : 'bg-slate-700'
                  }`}
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>

            {message.text && (
              <p className="font-mono text-xs text-slate-300 italic pl-1 select-text">
                "{message.text}"
              </p>
            )}
          </div>
        ) : isImage ? (
          /* Partner Shared Photo */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-xs p-1.5 shadow-md space-y-1.5 overflow-hidden">
            <QuotedReply replyTo={message.replyTo} />
            <div 
              className="rounded-xl overflow-hidden cursor-pointer hover:opacity-95 transition-opacity max-h-64 bg-slate-950 flex items-center justify-center"
              onClick={() => setShowImageModal(true)}
            >
              <img src={message.imageUrl} alt="Asset" className="max-h-64 w-auto object-cover rounded-lg" />
            </div>
            {message.text && (
              <p className="px-2 py-1 font-mono text-xs text-slate-200 whitespace-pre-wrap select-text">
                {message.text}
              </p>
            )}
          </div>
        ) : isCode ? (
          /* Partner Code Snippet */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-xs p-3 shadow-md space-y-1.5 max-w-full overflow-hidden">
            <QuotedReply replyTo={message.replyTo} />
            <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold pb-1 border-b border-slate-800">
              <span>💻 {message.codeLang || 'Code'}</span>
              <button onClick={handleCopy} className="text-slate-400 hover:text-white">
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre className="font-mono text-xs text-slate-200 overflow-x-auto p-2 rounded bg-slate-950 border border-slate-800">
              <code>{message.text}</code>
            </pre>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-xs px-3.5 py-2 shadow-md relative">
            <QuotedReply replyTo={message.replyTo} />
            {message.isAI && (
              <div className="flex items-center gap-1 mb-1 text-[10px] font-mono text-emerald-400">
                <span>🤖 AI live</span>
              </div>
            )}
            <p className="font-mono text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap select-text cursor-text">
              {message.text}
            </p>

            {/* Bottom action row: Listen voice & Copy */}
            <div className="mt-1.5 pt-1 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handlePlayVoice(character?.gender || 'female')}
                className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all ${
                  isPlayingVoice
                    ? 'bg-fuchsia-950 border-fuchsia-600 text-fuchsia-300 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-cyan-300'
                }`}
                title="Listen to romantic voice narration"
              >
                <span>{isPlayingVoice ? '⏹' : '🔊'}</span>
                <span>{isPlayingVoice ? 'Playing...' : 'Voice'}</span>
              </button>

              <div className="flex items-center gap-2 ml-auto">
                {onReply && (
                  <button
                    type="button"
                    onClick={() => onReply(message)}
                    className="text-[10px] font-mono text-slate-500 hover:text-cyan-300 transition-colors flex items-center gap-0.5"
                    title="Reply to message"
                  >
                    <span>↩️</span>
                    <span>Reply</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
                  title="Copy message"
                >
                  {copied ? '✓' : 'Copy'}
                </button>
                {timeStr && (
                  <span className="font-mono text-[10px] text-slate-500">{timeStr}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Image Preview Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-2xl max-h-[90vh] flex flex-col items-center">
            <img src={message.imageUrl} alt="Full view" className="max-h-[80vh] w-auto rounded-2xl shadow-2xl border border-slate-800 object-contain" />
            <button
              onClick={() => setShowImageModal(false)}
              className="mt-3 px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs font-bold"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}