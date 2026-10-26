// ─────────────────────────────────────────────────────────────────────────────
// RealPeerSidebar.jsx — Live Online Developer Stats, Profile & Switcher Sidebar
// Red, Black & White developer theme with Space Grotesk / JetBrains Mono
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import StatBar from '../ui/StatBar.jsx';
import { soundEngine } from '../../utils/audio.js';

export default function RealPeerSidebar({
  peer,
  userProfile,
  allOnlinePeers = [],
  unreadCounts = {},
  onSwitchPeer,
  onWave,
  onLike,
  onAddFriend,
  onCloseMobile,
  lang = 'en',
}) {
  const isAm = lang === 'am';

  // Calculate matching stats based on criteria
  const { matchScore, sharedTech, stats } = useMemo(() => {
    if (!peer) return { matchScore: 75, sharedTech: [], stats: {} };

    const userStack = userProfile?.techStack || ['React', 'TypeScript'];
    const peerStack = peer.techStack || [];
    const shared = peerStack.filter((t) => userStack.includes(t));
    const sameIndent = peer.indentation && userProfile?.indentation && peer.indentation === userProfile.indentation;
    const sameDrink = peer.drink && userProfile?.drink && peer.drink === userProfile.drink;

    const base = 68;
    const score = Math.min(99, base + shared.length * 10 + (sameIndent ? 8 : 0) + (sameDrink ? 5 : 0));

    // Dynamic developer stats
    const logicVal = Math.min(98, 70 + (peer.techStack?.length || 2) * 5);
    const romanceVal = score;
    const caffeineVal = peer.drink?.includes('Bunna') || peer.drink?.includes('Espresso') ? 95 : 82;
    const chemistryVal = Math.min(99, 65 + shared.length * 12);

    return {
      matchScore: score,
      sharedTech: shared,
      stats: {
        logic: logicVal,
        romance: romanceVal,
        caffeine: caffeineVal,
        chemistry: chemistryVal,
      },
    };
  }, [peer, userProfile]);

  if (!peer) return null;

  // Real follower count
  const followerCount = Array.isArray(peer.followers) ? peer.followers.length : 0;

  // Filter other peers for switcher (matching peer's gender, excluding current peer)
  const otherPeers = allOnlinePeers.filter(
    (p) => p.gender === peer.gender && p.id !== peer.id && p.id !== userProfile?.id
  );

  return (
    <aside
      className="w-64 sm:w-72 shrink-0 bg-black border-r border-zinc-800 flex flex-col h-full overflow-y-auto font-mono select-text"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a transparent' }}
    >
      {/* Top Header */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/90 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2   bg-red-500 animate-pulse" />
          <span className="text-xs text-white font-bold tracking-widest uppercase">
            {isAm ? "የቀጥታ ገንቢ ግንኙነት" : "Live Terminal"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-1   text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3.5 p-3 flex-1">
        {/* Active Real Peer Card with Red Glow */}
        <div className="bg-zinc-950 border border-red-900/60   p-3.5 space-y-3 transition-all relative overflow-hidden shadow-lg shadow-red-950/20">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12   bg-black border border-red-600 shadow flex items-center justify-center overflow-hidden shrink-0">
              {peer.avatarUrl ? (
                <img src={peer.avatarUrl} alt={peer.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">{peer.emoji || (peer.gender === 'female' ? '👩‍💻' : '👨‍💻')}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-white text-sm truncate">{peer.name}</h3>
              <p className="text-xs text-red-400 truncate">{peer.handle}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold">
                  {peer.gender === 'female' ? 'Girlfriend' : 'Boyfriend'}
                </span>
                <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5   bg-red-500 animate-pulse" />
                  <span>Online</span>
                </span>
              </div>
            </div>
          </div>

          {/* Followers, Location & Fuel Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
            <span className="px-2 py-0.5   bg-zinc-900 border border-zinc-800 text-white font-bold flex items-center gap-1">
              <span>{followerCount} followers</span>
            </span>
            {peer.location && (
              <span className="px-2 py-0.5   bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1">
                <span>{peer.location}</span>
              </span>
            )}
            <span className="px-2 py-0.5   bg-zinc-900 border border-zinc-800 text-amber-300 flex items-center gap-1">
              <span>{peer.drink || '☕ Bunna'}</span>
            </span>
            <span className="px-2 py-0.5   bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1">
              <span>⌨️ {peer.indentation || 'Tabs'}</span>
            </span>
          </div>

          {/* Quick Friend & Like Action Bar */}
          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => onWave?.(peer)}
              className="py-1.5   bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-amber-300 hover:text-white transition-all flex items-center justify-center gap-1 shadow-sm"
              title="Send coffee wave"
            >
              <span>👋</span>
            </button>

            <button
              type="button"
              onClick={() => onLike?.(peer)}
              className="py-1.5   bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-red-400 hover:text-white transition-all flex items-center justify-center gap-1 shadow-sm"
              title="Send love"
            >
              <span>❤️</span>
            </button>

            <button
              type="button"
              onClick={() => onAddFriend?.(peer)}
              className="py-1.5   bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-1 shadow-sm"
              title="Add friend"
            >
              <span>Request</span>
            </button>
          </div>
        </div>

        {/* Real Compatibility Meter */}
        <div className="bg-zinc-950 border border-zinc-800   p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-bold flex items-center gap-1">
              <span>{isAm ? "የመስፈርቶች ተኳሃኝነት" : "Compatibility"}</span>
            </span>
            <span className="font-bold text-red-400">{matchScore}%</span>
          </div>
          <div className="w-full bg-black   h-2 overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-red-700 via-red-500 to-white   transition-all duration-700 shadow"
              style={{ width: `${matchScore}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-500 leading-tight">
            {sharedTech.length > 0
              ? `Shared tech: ${sharedTech.join(', ')} · ${peer.indentation || 'Tabs'}`
              : `Both developers online · Compatible vibe`}
          </p>
        </div>

        {/* Developer Stats (Logic, Chemistry, Caffeine, Romance) */}
        <div className="bg-zinc-950 border border-zinc-800   p-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-1.5">
            <span className="font-bold text-white">// Developer Stats</span>
            <span className="text-[10px] text-red-400 font-mono">LIVE</span>
          </div>

          <div className="space-y-2">
            <StatBar label="Logic / Arch" value={stats.logic} color="cyan" />
            <StatBar label="Tech Chemistry" value={stats.chemistry} color="emerald" />
            <StatBar label="Bunna Fuel" value={stats.caffeine} color="amber" />
            <StatBar label="Romance Bond" value={stats.romance} color="fuchsia" />
          </div>
        </div>

        {/* Bio Terminal */}
        <div className="bg-zinc-950 border border-zinc-800   p-3 space-y-1.5 text-xs">
          <p className="text-zinc-300 text-xs leading-relaxed italic">
            "{peer.bio}"
          </p>
          {peer.currentStatus && (
            <p className="text-[11px] text-red-400 pt-1 font-mono">
              &gt; {peer.currentStatus}
            </p>
          )}
        </div>

        {/* Switch to Other Online Developers */}
        {otherPeers.length > 0 && (
          <div className="bg-zinc-950 border border-zinc-800   p-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">
                // {peer.gender === 'female' ? 'Other Girlfriends' : 'Other Boyfriends'}
              </span>
              <span className="text-[10px] text-zinc-500">({otherPeers.length})</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {otherPeers.map((other) => {
                const unread = unreadCounts[other.id] || 0;
                return (
                  <div
                    key={other.id}
                    className={`flex items-center justify-between p-2   bg-black border transition-all text-xs ${
                      unread > 0 ? 'border-red-600 shadow-md' : 'border-zinc-800 hover:border-red-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <div className="truncate">
                        <p className="font-bold text-white truncate text-[11px]">{other.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {unread > 0 && (
                        <span className="px-1.5 py-0.5   bg-red-600 text-white text-[9px] font-black animate-pulse">
                          {unread}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playRomanticChime();
                          onSwitchPeer?.(other);
                          onCloseMobile?.();
                        }}
                        className="px-2.5 py-1   bg-zinc-900 hover:bg-red-950 border border-zinc-700 hover:border-red-600 text-white text-[10px] font-bold transition-all"
                      >
                        Chat
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
