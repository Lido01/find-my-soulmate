// ─────────────────────────────────────────────────────────────────────────────
// PartnerProfileModal.jsx — In-Depth Developer Soulmate Profile Modal
// High-tech Red, Black & White developer social theme with JetBrains Mono / Space Grotesk
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
  onFollow,
  onOpenGiftModal,
  isFriend = false,
  isFollowing = false,
  isRequested = false,
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

  // Real follower count
  const followerCount = Array.isArray(peer.followers) ? peer.followers.length : 0;
  const likeCount = typeof peer.likes === 'number' ? peer.likes : (Array.isArray(peer.likedBy) ? peer.likedBy.length : 0);

  // Match score calculation
  const matchScore = Math.min(99, 68 + sharedTech.length * 10 + (sameIndent ? 8 : 0) + (sameDrink ? 5 : 0));

  function handleCopyShareLink() {
    soundEngine.playRomanticChime();
    const shareText = `Check out ${peer.name} (${peer.handle}) on DevSoulmate! 💖 Tech: ${peerTech.join(', ')}`;
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2400);
      }
    } catch {}
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in font-mono select-text"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-black border border-zinc-800 rounded-3xl shadow-2xl shadow-red-950/40 overflow-hidden flex flex-col max-h-[92vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Cover Gradient: Pitch Black with Crimson Ambient Line */}
        <div className="relative h-28 sm:h-32 bg-gradient-to-r from-zinc-950 via-red-950/40 to-zinc-950 border-b border-zinc-800/80 p-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-red-400">
              {peer.gender === 'female'
                ? (isAm ? 'የሴት ጓደኛ ካርድ' : 'Girlfriend Profile')
                : (isAm ? 'የወንድ ጓደኛ ካርድ' : 'Boyfriend Profile')}
            </span>

            {isOnline ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-red-500/60 text-red-400 text-[10px] font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>● Live Now</span>
              </span>
            ) : (
              <span className="text-[10px] text-zinc-500 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                Offline · Inbox Ready
              </span>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-red-600 flex items-center justify-center text-sm font-bold transition-all shadow"
            title="Close Profile"
          >
            ✕
          </button>
        </div>

        {/* Floating Avatar, Followers & Match Pill */}
        <div className="px-5 -mt-12 sm:-mt-14 flex items-end justify-between relative z-10 shrink-0">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black border-2 border-red-600 shadow-2xl flex items-center justify-center overflow-hidden">
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
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-red-500 ring-4 ring-black animate-pulse" />
            )}
          </div>

          {/* Followers & Match Score Pill */}
          <div className="flex flex-col items-end pb-1 gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-[11px] font-bold">
                🌟 {followerCount} followers
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-950/80 border border-red-600 text-red-200 font-bold text-xs sm:text-sm shadow">
                <span>💖</span>
                <span>{matchScore}% Match</span>
              </div>
            </div>
            <span className="text-[10px] text-zinc-400">
              {sharedTech.length > 0 ? `${sharedTech.length} Shared Tech Stacks` : 'Compatible Dev Vibe'}
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
              <span className="text-xs text-red-400 font-bold">{peer.handle}</span>
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-0.5 flex items-center gap-1.5">
              <span>📍</span>
              <span>{peer.location || 'Global Developer Community'}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400">❤️ {likeCount} likes</span>
            </p>
          </div>

          {/* Quote Card (if provided) */}
          {peer.quote && (
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-red-900/40 shadow-inner relative overflow-hidden">
              <span className="text-2xl text-red-500/30 absolute -top-1 left-2 font-serif select-none">“</span>
              <p className="text-xs sm:text-sm text-zinc-200 italic font-medium pl-4 pr-1 leading-relaxed">
                {peer.quote}
              </p>
              <span className="text-2xl text-red-500/30 absolute bottom-0 right-2 font-serif select-none">”</span>
            </div>
          )}

          {/* Developer Bio */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider block mb-1">
              {isAm ? 'ስለ እኔ (Bio)' : 'About / Bio'}
            </span>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
              {peer.bio || (isAm ? 'ንቁ እና ተስፈኛ የሶፍትዌር ገንቢ' : 'Passionate developer crafting elegant software solutions.')}
            </p>
          </div>

          {/* Tech Stack Pills */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                {isAm ? 'ቴክኖሎጂ እና ክህሎቶች' : 'Tech Stack & Skills'}
              </span>
              <span className="text-[10px] text-red-400 font-bold">
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
                        ? 'bg-red-950/80 border-red-500 text-white shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300'
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
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block mb-1">Indentation</span>
              <span className={`font-bold ${sameIndent ? 'text-red-400' : 'text-zinc-200'}`}>
                {peer.indentation || 'Tabs (4 spaces)'} {sameIndent && '✓'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block mb-1">Favorite Drink</span>
              <span className={`font-bold ${sameDrink ? 'text-amber-400' : 'text-zinc-200'}`}>
                {peer.drink || 'Ethiopian Bunna ☕'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block mb-1">Work Rhythm</span>
              <span className="font-bold text-zinc-200">
                Night Owl Builder
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[10px] text-zinc-500 block mb-1">Soulmate Goal</span>
              <span className="font-bold text-red-300 truncate block">
                Pair Programming
              </span>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons for Immediate Engagement */}
        <div className="p-3.5 border-t border-zinc-800 bg-zinc-950 shrink-0 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {/* Follow / Unfollow Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playRomanticChime();
                onFollow?.();
              }}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow ${
                isFollowing
                  ? 'bg-red-600 border-red-500 text-white hover:bg-red-700'
                  : 'bg-zinc-900 border-zinc-700 text-white hover:border-red-500'
              }`}
              title={isFollowing ? 'Unfollow' : 'Follow this developer'}
            >
              <span>{isFollowing ? '✓ Following' : '+ Follow'}</span>
            </button>

            {/* Friend Button */}
            <button
              type="button"
              disabled={isRequested}
              onClick={() => {
                onAddFriend?.();
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow ${
                isFriend
                  ? 'bg-zinc-800 border-zinc-600 text-white'
                  : isRequested
                  ? 'bg-zinc-900 border-zinc-800 text-zinc-400 cursor-not-allowed opacity-80'
                  : 'bg-red-950/70 border-red-600 hover:bg-red-900 text-white'
              }`}
              title={isFriend ? 'Friend' : isRequested ? 'Request Pending' : 'Add friend'}
            >
              <span>{isFriend ? '✓' : isRequested ? '⏳' : '👥'}</span>
              <span className="truncate">
                {isFriend
                  ? (isAm ? 'ጓደኛ ነው' : 'Friends')
                  : isRequested
                  ? (isAm ? 'ተልኳል' : 'Requested')
                  : (isAm ? 'የጓደኝነት ጥያቄ' : 'Send Request')}
              </span>
            </button>

            {/* Like Button */}
            <button
              type="button"
              onClick={() => {
                onLike?.();
              }}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow ${
                isLiked
                  ? 'bg-red-950 border-red-600 text-red-300'
                  : 'bg-zinc-900 border-zinc-800 hover:border-red-600 text-zinc-300'
              }`}
              title="Send dev like"
            >
              <span>{isLiked ? '💖' : '🤍'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Ethiopian Bunna Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playRomanticChime();
                onSendBunna?.();
                onClose();
              }}
              className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-600 text-amber-200 text-xs font-bold transition-all shadow"
              title="Send Ethiopian Bunna"
            >
              <span>☕</span>
            </button>

            {/* Gift Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playGiftFanfare();
                onOpenGiftModal?.();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-600 text-white text-xs font-bold transition-all shadow"
              title="Send a dev gift"
            >
              <span>🎁</span>
              <span>{isAm ? 'ስጦታ' : 'Gift'}</span>
            </button>

            {/* Share / Copy Link */}
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-600 text-zinc-300 text-xs transition-all"
              title="Share Profile Link"
            >
              <span>{copiedLink ? '✓' : '🔗'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
