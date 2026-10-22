// ─────────────────────────────────────────────────────────────────────────────
// PartnerProfileModal.jsx — In-Depth Developer Soulmate Profile Modal
// Shows what they have, how they look, tech stack, dev habits, and engagement actions
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { soundEngine } from '../../utils/audio.js';

export default function PartnerProfileModal({
  isOpen,
  onClose,
  peer,
  userProfile,
  isOnline = false,
  onSendBunna,
  onAddFriend,
  onLike,
  onOpenGiftModal,
  isFriend = false,
  isLiked = false,
  lang = 'en',
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const isAm = lang === 'am';

  if (!isOpen || !peer) return null;

  const userTech = userProfile?.techStack || ['React', 'TypeScript'];
  const peerTech = peer.techStack || [];
  const sharedTech = peerTech.filter((t) => userTech.includes(t));
  const sameIndent = peer.indentation && userProfile?.indentation && peer.indentation === userProfile.indentation;
  const sameDrink = peer.drink && userProfile?.drink && peer.drink === userProfile.drink;

  // Compatibility score calculation
  const matchScore = Math.min(99, 68 + sharedTech.length * 10 + (sameIndent ? 8 : 0) + (sameDrink ? 5 : 0));

  function handleCopyShareLink() {
    soundEngine.playRomanticChime();
    const shareText = `Checkout ${peer.name} (${peer.handle}) on Find My Soulmate! 💖 Tech: ${peerTech.join(', ')}`;
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2400);
      }
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in font-mono select-text">
      <div
        className="relative w-full max-w-lg bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Cover Gradient */}
        <div className="relative h-28 sm:h-32 bg-gradient-to-r from-slate-900 via-cyan-950/70 to-slate-900 border-b border-slate-800/80 p-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-cyan-300">
              {peer.gender === 'female' ? (isAm ? 'የሴት ጓደኛ ካርድ' : 'Girlfriend Profile') : (isAm ? 'የወንድ ጓደኛ ካርድ' : 'Boyfriend Profile')}
            </span>

            {isOnline ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Online</span>
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-800">
                Offline · Inbox Ready
              </span>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-950/80 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-all shadow hover:bg-slate-800"
            title="Close Profile"
          >
            ✕
          </button>
        </div>

        {/* Floating Avatar & Match Pill */}
        <div className="px-5 -mt-12 sm:-mt-14 flex items-end justify-between relative z-10 shrink-0">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-950 border-2 border-cyan-500 shadow-2xl flex items-center justify-center overflow-hidden">
              {peer.avatarUrl ? (
                <img
                  src={peer.avatarUrl}
                  alt={peer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl sm:text-5xl">
                  {peer.emoji || (peer.gender === 'female' ? '👩‍💻' : '👨‍💻')}
                </span>
              )}
            </div>
            {isOnline && (
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 ring-4 ring-slate-950" />
            )}
          </div>

          {/* Match Score Badge */}
          <div className="flex flex-col items-end pb-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-950/90 border border-cyan-500/70 text-cyan-300 font-bold text-xs sm:text-sm shadow">
              <span>💖</span>
              <span>{matchScore}% Match</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1">
              {sharedTech.length > 0 ? `${sharedTech.length} Shared Tech Stacks` : 'Compatible Vibe'}
            </span>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div
          className="flex-1 overflow-y-auto p-5 space-y-4"
          style={{ scrollbarWidth: 'thin' }}
        >
          {/* Identity & Location */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-white">{peer.name}</h2>
              <span className="text-xs text-slate-400 font-bold">{peer.handle}</span>
            </div>
            <p className="text-xs text-cyan-400 font-bold mt-0.5 flex items-center gap-1.5">
              <span>📍</span>
              <span>{peer.location || 'Global Developer Community'}</span>
            </p>
          </div>

          {/* Quote Card (if provided) */}
          {peer.quote && (
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-900/60 shadow relative overflow-hidden">
              <span className="text-2xl text-cyan-500/30 absolute -top-1 left-2 font-serif select-none">“</span>
              <p className="text-xs sm:text-sm text-cyan-200 italic font-medium pl-4 pr-1 leading-relaxed">
                {peer.quote}
              </p>
              <span className="text-2xl text-cyan-500/30 absolute bottom-0 right-2 font-serif select-none">”</span>
            </div>
          )}

          {/* Developer Bio */}
          <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              {isAm ? 'ስለ እኔ (Bio)' : 'About / Bio'}
            </span>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {peer.bio || (isAm ? 'ንቁ እና ተስፈኛ የሶፍትዌር ገንቢ' : 'Passionate developer crafting elegant software solutions.')}
            </p>
          </div>

          {/* Tech Stack Pills */}
          <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isAm ? 'ቴክኖሎጂ እና ክህሎቶች' : 'Tech Stack & Skills'}
              </span>
              <span className="text-[10px] text-cyan-400 font-bold">
                {sharedTech.length} in common
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {peerTech.map((tech) => {
                const isShared = userTech.includes(tech);
                return (
                  <span
                    key={tech}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-all ${
                      isShared
                        ? 'bg-cyan-950/90 border-cyan-500 text-cyan-200 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    {tech} {isShared && '✨'}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Dev Habits & Quirks Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">Indentation</span>
              <span className={`font-bold ${sameIndent ? 'text-emerald-400' : 'text-slate-200'}`}>
                {peer.indentation || 'Tabs (4 spaces)'} {sameIndent && '✓'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">Favorite Drink</span>
              <span className={`font-bold ${sameDrink ? 'text-amber-400' : 'text-slate-200'}`}>
                {peer.drink || 'Ethiopian Bunna ☕'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">Work Rhythm</span>
              <span className="font-bold text-slate-200">
                Night Owl Builder 🦉
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">Soulmate Goal</span>
              <span className="font-bold text-fuchsia-300 truncate block">
                Pair Programming 💖
              </span>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons for Immediate Engagement */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 shrink-0 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {/* Ethiopian Bunna Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playRomanticChime();
                onSendBunna?.();
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-950/70 border border-amber-600/70 hover:bg-amber-900 text-amber-200 text-xs font-bold transition-all shadow"
              title="Send hot Ethiopian Bunna"
            >
              <span>☕</span>
              <span className="truncate">{isAm ? 'ቡና ላክ' : 'Send Bunna'}</span>
            </button>

            {/* Friend Button */}
            <button
              type="button"
              onClick={() => {
                onAddFriend?.();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow ${
                isFriend
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-200'
              }`}
              title="Add or remove friend"
            >
              <span>👥</span>
              <span className="truncate">{isFriend ? (isAm ? 'ጓደኛ ነው' : 'Friends') : (isAm ? 'ጓደኛ አድርግ' : 'Add Friend')}</span>
            </button>

            {/* Like Button */}
            <button
              type="button"
              onClick={() => {
                onLike?.();
              }}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow ${
                isLiked
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                  : 'bg-slate-900 border-slate-700 hover:border-rose-500 text-slate-300'
              }`}
              title="Send romantic dev like"
            >
              <span>{isLiked ? '💖' : '🤍'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Gift Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playGiftFanfare();
                onOpenGiftModal?.();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-fuchsia-950/80 border border-fuchsia-600 hover:bg-fuchsia-900 text-fuchsia-200 text-xs font-bold transition-all shadow"
              title="Send a dev gift"
            >
              <span>🎁</span>
              <span>{isAm ? 'ስጦታ' : 'Gift'}</span>
            </button>

            {/* Share / Copy Link */}
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-slate-300 text-xs transition-all"
              title="Share / Copy Profile Link"
            >
              <span>{copiedLink ? '✓' : '🔗'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
