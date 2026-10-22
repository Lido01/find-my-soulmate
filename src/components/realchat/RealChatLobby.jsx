// ─────────────────────────────────────────────────────────────────────────────
// RealChatLobby.jsx — Developer Matchmaking Lobby & Social Terminal
// Clean dark terminal workstation theme with instant Live Match controls
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { wsService } from '../../services/websocket.js';
import { soundEngine } from '../../utils/audio.js';
import { IconZap, IconTerminal, IconCheck, IconRefresh } from '../ui/Icons.jsx';

export default function RealChatLobby({
  userProfile,
  onOpenProfile,
  onOpenRegister,
  onBackToModeSelect,
  lang = 'en',
}) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isSimulated, setIsSimulated] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [searchTarget, setSearchTarget] = useState(() => userProfile?.lookingFor || 'female'); // 'female' (GF) | 'male' (BF)
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'friends' | 'feed'
  const [matchingSeconds, setMatchingSeconds] = useState(0);

  // Social interactions state
  const [myFriends, setMyFriends] = useState(() => new Set(userProfile?.friends || []));
  const [likedUserIds, setLikedUserIds] = useState(new Set());
  const [wavedUserIds, setWavedUserIds] = useState(new Set());
  const [communityPosts, setCommunityPosts] = useState([]);
  const [newStatusText, setNewStatusText] = useState('');
  const [socialToast, setSocialToast] = useState(null);

  const isAm = lang === 'am';

  // Live Match timer
  useEffect(() => {
    let timer = null;
    if (isMatching) {
      setMatchingSeconds(0);
      timer = setInterval(() => setMatchingSeconds((s) => s + 1), 1000);
    } else {
      setMatchingSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isMatching]);

  useEffect(() => {
    // Connect WebSocket
    wsService.connect();

    // Register active user profile
    if (userProfile) {
      wsService.registerProfile({
        ...userProfile,
        lookingFor: searchTarget,
      });
    }

    // Load initial community posts from backend
    wsService.fetchCommunityPosts().then((posts) => {
      if (posts && posts.length > 0) setCommunityPosts(posts);
    });

    const unbindStatus = wsService.on('connection:status', (data) => {
      setConnectionStatus(data.status);
      setIsSimulated(Boolean(data.isSimulated));
    });

    const unbindPresence = wsService.on('presence:update', (data) => {
      setOnlineUsers(data.users || []);
    });

    const unbindWaiting = wsService.on('match:waiting', () => {
      setIsMatching(true);
    });

    const unbindMatched = wsService.on('match:found', () => {
      setIsMatching(false);
      soundEngine.playMatchFound();
    });

    const unbindAnnouncement = wsService.on('community:announcement', (data) => {
      showSocialToast(data.announcement || data.message || 'Developer joined the community');
      soundEngine.playMessageBeep();
    });

    const unbindSocialAction = wsService.on('social:action', (data) => {
      if (data.targetUserId === userProfile?.id) {
        if (data.action === 'wave') {
          showSocialToast(`👋 ${data.fromUser?.name || 'A developer'} sent you a coffee wave!`);
          soundEngine.playRomanticChime();
        } else if (data.action === 'like') {
          showSocialToast(`💖 ${data.fromUser?.name || 'A developer'} liked your dev profile!`);
          soundEngine.playHeartbeat();
        } else if (data.action === 'add_friend') {
          showSocialToast(`👥 ${data.fromUser?.name || 'A developer'} added you as a friend!`);
          soundEngine.playGiftFanfare();
        }
      }
    });

    const unbindNewPost = wsService.on('social:new_post', (post) => {
      setCommunityPosts((prev) => [post, ...prev]);
    });

    return () => {
      unbindStatus();
      unbindPresence();
      unbindWaiting();
      unbindMatched();
      unbindAnnouncement();
      unbindSocialAction();
      unbindNewPost();
    };
  }, [userProfile, searchTarget]);

  function showSocialToast(msg) {
    setSocialToast(msg);
    setTimeout(() => setSocialToast(null), 3600);
  }

  // Filter developers according to chosen target (Girlfriend = female, Boyfriend = male)
  const filteredUsers = onlineUsers.filter(
    (u) => u.gender === searchTarget && u.id !== userProfile?.id
  );

  // Filter for Friends tab
  const friendsList = onlineUsers.filter(
    (u) => myFriends.has(u.id) || (userProfile?.friends && userProfile.friends.includes(u.id))
  );

  function handleStartMatch() {
    if (!userProfile?.isRegistered) {
      soundEngine.playHeartbeat();
      showSocialToast(isAm ? 'እባክዎ የቀጥታ ግጥሚያ ከመጀመርዎ በፊት ይመዝገቡ' : 'Please register your profile before starting live match');
      onOpenRegister?.(searchTarget);
      return;
    }
    soundEngine.playHeartbeat();
    setIsMatching(true);
    wsService.findMatch(searchTarget);
  }

  function handleCancelMatch() {
    setIsMatching(false);
    wsService.leaveRoom();
  }

  function handleDirectChat(peer) {
    if (!userProfile?.isRegistered) {
      soundEngine.playHeartbeat();
      showSocialToast(isAm ? 'እባክዎ ውይይት ከመጀመርዎ በፊት ይመዝገቡ' : 'Please register your profile before starting chat');
      onOpenRegister?.(peer.gender);
      return;
    }
    soundEngine.playRomanticChime();
    wsService.startDirectChat(peer);
  }

  function handleWave(user) {
    soundEngine.playRomanticChime();
    setWavedUserIds((prev) => new Set([...prev, user.id]));
    wsService.sendSocialAction('wave', user.id);
    showSocialToast(
      isAm ? `👋 ለ ${user.name} የቡና ሰላምታ ላኩ!` : `👋 Sent a coffee wave to ${user.name}!`
    );
  }

  function handleLike(user) {
    soundEngine.playHeartbeat();
    setLikedUserIds((prev) => new Set([...prev, user.id]));
    wsService.sendSocialAction('like', user.id);
    showSocialToast(
      isAm ? `💖 የ ${user.name} ካርድ ወደዱት!` : `💖 Sent developer love to ${user.name}!`
    );
  }

  function handleToggleFriend(user) {
    soundEngine.playGiftFanfare();
    const nextFriends = new Set(myFriends);
    if (nextFriends.has(user.id)) {
      nextFriends.delete(user.id);
      showSocialToast(`Removed ${user.name} from friends`);
    } else {
      nextFriends.add(user.id);
      wsService.sendSocialAction('add_friend', user.id);
      showSocialToast(
        isAm ? `👥 ${user.name} አሁን የጓደኞችዎ ዝርዝር ውስጥ ገብቷል!` : `👥 ${user.name} added to friends!`
      );
    }
    setMyFriends(nextFriends);
  }

  async function handlePostStatus(e) {
    e?.preventDefault();
    if (!newStatusText.trim()) return;

    soundEngine.playRomanticChime();
    const created = await wsService.createStatusPost(newStatusText.trim());
    if (created) {
      setCommunityPosts((prev) => [created, ...prev]);
      setNewStatusText('');
      showSocialToast(isAm ? 'ሀሳብዎ ተለጥፏል!' : 'Your status has been posted!');
    }
  }

  return (
    <div className="min-h-full bg-slate-950 text-slate-200 font-mono flex flex-col p-3 sm:p-5 select-text">
      {/* Toast Notification */}
      {socialToast && (
        <div className="fixed top-14 right-4 z-50 p-2.5 rounded-lg bg-slate-900 border border-cyan-500/80 shadow-2xl text-xs text-cyan-200 flex items-center gap-2 animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold">{socialToast}</span>
          <button onClick={() => setSocialToast(null)} className="text-slate-400 hover:text-white ml-1">✕</button>
        </div>
      )}

      <div className="max-w-4xl mx-auto w-full space-y-4">
        {/* ── UNIFIED LIVE MATCHMAKING CONTROL (Always Visible & Prominent) ── */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 sm:p-4 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Target Toggle: Girlfriend vs Boyfriend */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playRomanticChime();
                  setSearchTarget('female');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  searchTarget === 'female'
                    ? 'bg-cyan-950 border border-cyan-600 text-cyan-200 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>👩‍💻</span>
                <span>Girlfriend</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playRomanticChime();
                  setSearchTarget('male');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  searchTarget === 'male'
                    ? 'bg-cyan-950 border border-cyan-600 text-cyan-200 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>👨‍💻</span>
                <span>Boyfriend</span>
              </button>
            </div>
          </div>

          {/* Action Button & Match State */}
          <div className="pt-1">
            {isMatching ? (
              <div className="p-3 rounded-lg bg-slate-950 border border-cyan-800 flex items-center justify-between gap-3 animate-pulse">
                <div className="flex items-center gap-2.5">
                  <IconRefresh className="w-4 h-4 text-cyan-400 animate-spin" />
                  <div>
                    <span className="text-xs font-bold text-cyan-300">
                      Scanning WebSocket for a matching {searchTarget === 'female' ? 'Girlfriend' : 'Boyfriend'}...
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Searching matching criteria ({matchingSeconds}s)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCancelMatch}
                  className="px-3 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartMatch}
                className="w-full py-2.5 px-4 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 hover:border-cyan-500 text-cyan-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md group cursor-pointer"
              >
                <IconZap className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>
                  {isAm
                    ? `አሁኑኑ በቀጥታ ግጥሚያ ጀምር (${filteredUsers.length} ዝግጁ ናቸው)`
                    : `Start Live Match (${filteredUsers.length} Online ${searchTarget === 'female' ? 'Girlfriends' : 'Boyfriends'})`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Compact User Profile Bar */}
        <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">{userProfile?.emoji || '🧑‍💻'}</span>
            <span className="font-bold text-white truncate">{userProfile?.name}</span>
            <span className="text-slate-500 text-[11px] hidden sm:inline">{userProfile?.handle}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400 font-bold">
              {userProfile?.indentation || 'Tabs'}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400 hidden sm:inline">
              {userProfile?.drink || '☕ Bunna'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span>Stack:</span>
            {(userProfile?.techStack || ['React', 'TypeScript']).slice(0, 3).map((t, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Clean Segmented Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'discover'
                ? 'bg-slate-900 border border-slate-700 text-cyan-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Online Peers</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400">
              {filteredUsers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('friends')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'friends'
                ? 'bg-slate-900 border border-slate-700 text-cyan-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Friends</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400">
              {friendsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'feed'
                ? 'bg-slate-900 border border-slate-700 text-cyan-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Dev Feed</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400">
              {communityPosts.length}
            </span>
          </button>
        </div>

        {/* ── TAB 1: ONLINE PEERS ─────────────────────────────────────────── */}
        {activeTab === 'discover' && (
          <div className="space-y-3 animate-fade-in">
            {filteredUsers.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <p className="text-sm text-slate-400">
                  No {searchTarget === 'female' ? 'girlfriends' : 'boyfriends'} currently online in your network.
                </p>
                <p className="text-xs text-slate-500">
                  Click "Start Live Match" above to register into the matchmaking queue!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredUsers.map((user) => {
                  const sharedTech = (user.techStack || []).filter((t) =>
                    (userProfile?.techStack || ['React', 'TypeScript']).includes(t)
                  );
                  const sameIndent = user.indentation && userProfile?.indentation && user.indentation === userProfile.indentation;
                  const matchScore = Math.min(99, 65 + sharedTech.length * 12 + (sameIndent ? 10 : 0));
                  const isFriend = myFriends.has(user.id);
                  const isLiked = likedUserIds.has(user.id);
                  const isWaved = wavedUserIds.has(user.id);

                  return (
                    <div
                      key={user.id}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 shadow-sm"
                    >
                      <div className="space-y-2">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="text-2xl p-1 rounded-lg bg-slate-950 border border-slate-800">
                              {user.emoji || (user.gender === 'female' ? '👩‍💻' : '👨‍💻')}
                            </span>
                            <div>
                              <h4 className="text-xs font-bold text-white">{user.name}</h4>
                              <p className="text-[11px] text-slate-500">{user.handle}</p>
                            </div>
                          </div>

                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                            {matchScore}% Match
                          </span>
                        </div>

                        {/* Bio */}
                        <p className="text-xs text-slate-300 line-clamp-2">
                          "{user.bio}"
                        </p>

                        {/* Tech Stack Pills */}
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {(user.techStack || []).slice(0, 3).map((tech, idx) => (
                            <span
                              key={idx}
                              className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                sharedTech.includes(tech)
                                  ? 'bg-cyan-950 border-cyan-700 text-cyan-300 font-bold'
                                  : 'bg-slate-950 border-slate-800 text-slate-400'
                              }`}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Social Actions & Direct Chat */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        <div className="grid grid-cols-3 gap-1 text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleWave(user)}
                            className={`py-1 rounded border text-center transition-colors ${
                              isWaved
                                ? 'bg-amber-950 border-amber-700 text-amber-300'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            👋 {isWaved ? 'Waved' : 'Wave'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleLike(user)}
                            className={`py-1 rounded border text-center transition-colors ${
                              isLiked
                                ? 'bg-cyan-950 border-cyan-700 text-cyan-300'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            💖 {user.likes + (isLiked ? 1 : 0)}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleFriend(user)}
                            className={`py-1 rounded border text-center transition-colors ${
                              isFriend
                                ? 'bg-slate-800 border-slate-700 text-slate-200'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {isFriend ? 'Friend' : '+Friend'}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDirectChat(user)}
                          className="w-full py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-700 text-cyan-300 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>Connect 1-on-1 →</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: FRIENDS ──────────────────────────────────────────────── */}
        {activeTab === 'friends' && (
          <div className="space-y-3 animate-fade-in">
            {friendsList.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <p className="text-sm text-slate-300">No friends added yet.</p>
                <p className="text-xs text-slate-500">
                  Click "+Friend" on any developer profile in Online Peers to connect!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {friendsList.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1 rounded-lg bg-slate-950 border border-slate-800">
                        {friend.emoji || '🧑‍💻'}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white">{friend.name}</h4>
                        <p className="text-[11px] text-slate-500">{friend.handle}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2">"{friend.bio}"</p>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleWave(friend)}
                        className="py-1 px-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-amber-300 hover:bg-slate-800"
                        title="Wave"
                      >
                        👋
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDirectChat(friend)}
                        className="flex-1 py-1 px-3 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-bold text-xs text-center"
                      >
                        Chat Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: DEV SOCIAL FEED ──────────────────────────────────────── */}
        {activeTab === 'feed' && (
          <div className="space-y-3 animate-fade-in max-w-2xl mx-auto w-full">
            <form onSubmit={handlePostStatus} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <textarea
                rows={2}
                value={newStatusText}
                onChange={(e) => setNewStatusText(e.target.value)}
                placeholder={isAm ? "ስለ ምን እያሰቡ ነው? ለምሳሌ: React ስሰራ ቡና ያስፈልገኛል ☕..." : "What are you coding or thinking? Share with the dev community..."}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg p-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Shared in real-time</span>
                <button
                  type="submit"
                  disabled={!newStatusText.trim()}
                  className="px-3 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-bold disabled:opacity-40"
                >
                  Post Status
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {communityPosts.map((post) => (
                <div key={post.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{post.authorEmoji || '🧑‍💻'}</span>
                      <span className="text-xs font-bold text-white">{post.authorName}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 pl-1">{post.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}