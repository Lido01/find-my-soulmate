// ─────────────────────────────────────────────────────────────────────────────
// RealPeerSidebar.jsx — Live Online Developer Stats, Profile & Switcher Sidebar
// Matches the AI chat mode sidebar style for real online WebSocket connections.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react';
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

  // Filter other peers for switcher (matching peer's gender, excluding current peer)
  const otherPeers = allOnlinePeers.filter(
    (p) => p.gender === peer.gender && p.id !== peer.id && p.id !== userProfile?.id
  );

  return (
    <aside
      className="w-64 sm:w-72 shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col h-full overflow-y-auto font-mono select-text"
      style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}
    >
      {/* Top Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300 font-bold tracking-widest uppercase">
            {isAm ? "የቀጥታ ገንቢ ግንኙነት" : "Live"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
            Live Peer
          </span>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3.5 p-3 flex-1">
        {/* Active Real Peer Card with Neon Glow */}
        <div
          className="bg-slate-900 border rounded-2xl p-3.5 space-y-3 transition-all relative overflow-hidden shadow-lg"
          style={{
            borderColor: '#06b6d4',
            boxShadow: '0 0 16px rgba(6, 182, 212, 0.25), 0 0 32px rgba(6, 182, 212, 0.1)',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 shadow flex items-center justify-center overflow-hidden shrink-0">
              {peer.avatarUrl ? (
                <img src={peer.avatarUrl} alt={peer.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">{peer.emoji || (peer.gender === 'female' ? '👩‍💻' : '👨‍💻')}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-white text-sm truncate">{peer.name}</h3>
              <p className="text-xs text-slate-400 truncate">{peer.handle}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-fuchsia-950/80 border border-fuchsia-700/80 text-fuchsia-300 font-bold">
                  {peer.gender === 'female' ? 'Girlfriend 👩‍💻' : 'Boyfriend 👨‍💻'}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online</span>
                </span>
              </div>
            </div>
          </div>

          {/* Location & Fuel Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
            {peer.location && (
              <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1">
                <span>📍</span>
                <span>{peer.location}</span>
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-amber-300 flex items-center gap-1">
              <span>{peer.drink || '☕ Bunna'}</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-emerald-300 flex items-center gap-1">
              <span>⌨️ {peer.indentation || 'Tabs'}</span>
            </span>
          </div>

          {/* Quick Friend & Like Action Bar */}
          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => onWave?.(peer)}
              className="py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-amber-300 hover:text-white transition-all flex items-center justify-center gap-1 shadow-sm"
              title="Send coffee wave"
            >
              <span>👋</span>
              <span>Wave</span>
            </button>

            <button
              type="button"
              onClick={() => onLike?.(peer)}
              className="py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-fuchsia-300 hover:text-white transition-all flex items-center justify-center gap-1 shadow-sm"
              title="Send love"
            >
              <span>💖</span>
              <span>Like</span>
            </button>

            <button
              type="button"
              onClick={() => onAddFriend?.(peer)}
              className="py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-indigo-300 hover:text-white transition-all flex items-center justify-center gap-1 shadow-sm"
              title="Add friend"
            >
              <span>👥</span>
              <span>Friend</span>
            </button>
          </div>
        </div>

        {/* Real Compatibility Meter */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <span>✨</span>
              <span>{isAm ? "የመስፈርቶች ተኳሃኝነት" : "Criteria Chemistry"}</span>
            </span>
            <span className="font-bold text-cyan-300">{matchScore}%</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-fuchsia-500 rounded-full transition-all duration-700 shadow"
              style={{ width: `${matchScore}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            {sharedTech.length > 0
              ? `Shared tech: ${sharedTech.join(', ')} · ${peer.indentation || 'Tabs'}`
              : `Both developers online · Compatible vibe`}
          </p>
        </div>

        {/* Developer Stats (Logic, Chemistry, Caffeine, Romance) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2.5">
          <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-300">// Developer Stats</span>
            <span className="text-[10px] text-cyan-400 font-mono">LIVE</span>
          </div>

          <div className="space-y-2">
            <StatBar label="Logic / Arch" value={stats.logic} color="cyan" />
            <StatBar label="Tech Chemistry" value={stats.chemistry} color="emerald" />
            <StatBar label="Bunna Fuel" value={stats.caffeine} color="amber" />
            <StatBar label="Romance Bond" value={stats.romance} color="fuchsia" />
          </div>
        </div>

        {/* Tech Stack Pills */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2">
          <span className="font-bold text-xs text-slate-300 block">
            // {isAm ? "የቴክኖሎጂ ችሎታ" : "Tech Stack"}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(peer.techStack || ['React', 'TypeScript']).map((tech, i) => {
              const isMutual = sharedTech.includes(tech);
              return (
                <span
                  key={i}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition-all ${
                    isMutual
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {isMutual ? `⚡ ${tech}` : tech}
                </span>
              );
            })}
          </div>
        </div>

        {/* Bio Terminal */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] border-b border-slate-900 pb-1">
            <span className="w-2 h-2 rounded-full bg-red-500/70" />
            <span className="w-2 h-2 rounded-full bg-amber-500/70" />
            <span className="w-2 h-2 rounded-full bg-emerald-500/70" />
            <span className="ml-1">bio.md</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed italic">
            "{peer.bio}"
          </p>
          {peer.currentStatus && (
            <p className="text-[11px] text-cyan-300/90 pt-1 font-mono">
              &gt; {peer.currentStatus}
            </p>
          )}
        </div>

        {/* Switch to Other Online Developers */}
        {otherPeers.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">
                // {peer.gender === 'female' ? 'Other Girlfriends' : 'Other Boyfriends'}
              </span>
              <span className="text-[10px] text-slate-500">({otherPeers.length})</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {otherPeers.map((other) => {
                const unread = unreadCounts[other.id] || 0;
                return (
                  <div
                    key={other.id}
                    className={`flex items-center justify-between p-2 rounded-xl bg-slate-950 border transition-all text-xs ${
                      unread > 0 ? 'border-rose-500/80 shadow-md' : 'border-slate-800/80 hover:border-cyan-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                        {other.avatarUrl ? (
                          <img src={other.avatarUrl} alt={other.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm">{other.emoji || '🧑‍💻'}</span>
                        )}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-white truncate text-[11px]">{other.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{other.handle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {unread > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
                          💬 {unread}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.playRomanticChime();
                          onSwitchPeer?.(other);
                          onCloseMobile?.();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-[10px] font-bold transition-all"
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
