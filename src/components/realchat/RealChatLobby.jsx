// ─────────────────────────────────────────────────────────────────────────────
// RealChatLobby.jsx — Developer Matchmaking Lobby & Social Terminal
// Shows ALL registered users with clear Live/Offline status & no clipping
// Locked to user's chosen target (GF or BF) until changed in Settings
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { wsService } from '../../services/websocket.js';
import { soundEngine } from '../../utils/audio.js';
import { IconZap, IconRefresh } from '../ui/Icons.jsx';
import PartnerProfileModal from './PartnerProfileModal.jsx';

export default function RealChatLobby({
  userProfile,
  unreadCounts = {},
  onSelectPeer,
  onOpenProfile,
  onOpenRegister,
  onBackToModeSelect,
  lang = 'en',
}) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isSimulated, setIsSimulated] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'friends' | 'feed'
  const [matchingSeconds, setMatchingSeconds] = useState(0);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'online' | 'shared_tech' | 'bunna' | 'tabs' | 'spaces'
  const [inspectPeer, setInspectPeer] = useState(null);

  // Locked strictly to user's registered target preference
  const searchTarget = userProfile?.lookingFor === 'male' ? 'male' : 'female';

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

    // Register active user profile with chosen target
    if (userProfile) {
      wsService.registerProfile({
        ...userProfile,
        lookingFor: searchTarget,
      });
    }

    // Fetch ALL registered users from backend database on mount
    wsService.fetchRegisteredUsers().then((users) => {
      if (users && users.length > 0) setDbUsers(users);
    });

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

  // Combine database users and active WebSocket presence so ALL users are always visible
  const allKnownUsersMap = new Map();
  // 1. Seed from database users
  for (const u of dbUsers) {
    allKnownUsersMap.set(u.id, { ...u, isLiveNow: false });
  }
  // 2. Overlay live presence from WebSocket
  for (const u of onlineUsers) {
    const existing = allKnownUsersMap.get(u.id) || {};
    allKnownUsersMap.set(u.id, {
      ...existing,
      ...u,
      isLiveNow: Boolean(u.isLiveSocket),
    });
  }

  const combinedUsers = Array.from(allKnownUsersMap.values());

  // Strictly filter according to chosen preference (NO non-chosen gender shown)
  const filteredUsers = combinedUsers.filter(
    (u) => u.gender === searchTarget && u.id !== userProfile?.id
  );

  // Search query & filter pills refinement
  const searchedUsers = filteredUsers.filter((u) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchHandle = u.handle?.toLowerCase().includes(q);
      const matchBio = u.bio?.toLowerCase().includes(q);
      const matchQuote = u.quote?.toLowerCase().includes(q);
      const matchLoc = u.location?.toLowerCase().includes(q);
      const matchTech = (u.techStack || []).some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchHandle && !matchBio && !matchQuote && !matchLoc && !matchTech) {
        return false;
      }
    }

    if (activeFilter === 'online') return u.isLiveNow;
    if (activeFilter === 'shared_tech') {
      const myTech = userProfile?.techStack || ['React', 'TypeScript'];
      return (u.techStack || []).some((t) => myTech.includes(t));
    }
    if (activeFilter === 'bunna') return u.drink?.includes('Bunna') || u.drink?.includes('Ethiopian');
    if (activeFilter === 'tabs') return u.indentation === 'Tabs';
    if (activeFilter === 'spaces') return u.indentation === 'Spaces';

    return true;
  });

  // Filter for Friends tab
  const friendsList = combinedUsers.filter(
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

  // Connect & Chat with peer (Works smoothly whether peer is live or offline)
  function handleDirectChat(peer) {
    if (!userProfile?.isRegistered) {
      soundEngine.playHeartbeat();
      showSocialToast(isAm ? 'እባክዎ ውይይት ከመጀመርዎ በፊት ይመዝገቡ' : 'Please register your profile before starting chat');
      onOpenRegister?.(peer.gender);
      return;
    }
    soundEngine.playRomanticChime();
    onSelectPeer?.(peer);
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
    <div className="min-h-full bg-slate-950 text-slate-200 font-mono flex flex-col p-3 sm:p-5 select-text overflow-y-auto">
      {/* Toast Notification */}
      {socialToast && (
        <div className="fixed top-14 right-4 z-50 p-2.5 rounded-2xl bg-slate-900 border border-cyan-500/80 shadow-2xl text-xs text-cyan-200 flex items-center gap-2 animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold">{socialToast}</span>
          <button onClick={() => setSocialToast(null)} className="text-slate-400 hover:text-white ml-1">✕</button>
        </div>
      )}

      <div className="max-w-4xl mx-auto w-full space-y-4">
        {/* Top Header Row */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToModeSelect}
              className="px-2.5 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
            >
              <span>←</span>
              <span>{isAm ? "ተመለስ" : "Back"}</span>
            </button>

            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl">
              <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-[11px] text-slate-300 font-bold">
                {connectionStatus === 'connected'
                  ? (isSimulated ? 'Mesh Network' : 'Live WebSocket')
                  : 'Connecting...'}
              </span>
            </div>
          </div>

          {/* Quick Edit Card Button */}
          <button
            type="button"
            onClick={() => onOpenRegister?.(searchTarget)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-800 hover:border-cyan-600 text-cyan-300 transition-colors"
            title="Edit your developer dating profile"
          >
            <span>{userProfile?.emoji || '🧑‍💻'}</span>
            <span className="font-bold hidden sm:inline">{userProfile?.name || 'My Profile'}</span>
            <span className="text-[10px] text-slate-400 sm:hidden">Edit</span>
          </button>
        </div>





        {/* Clean Segmented Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'discover'
                ? 'bg-slate-900 border border-slate-700 text-cyan-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Registered Peers</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400">
              {filteredUsers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('friends')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
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
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
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

        {/* ── TAB 1: ALL REGISTERED & ONLINE PEERS (No fixed position, fully scrollable) ── */}
        {activeTab === 'discover' && (
          <div className="space-y-3.5 animate-fade-in pb-8">
            {/* Search Input & Filter Chips */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isAm
                        ? 'በስም፣ በቴክኖሎጂ፣ በቦታ ወይም በመግለጫ ፈልግ...'
                        : 'Search by name, tech stack, bio, location...'
                    }
                    className="w-full pl-8 pr-8 py-2 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-white"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] shrink-0">
                  {[
                    { id: 'all', label: isAm ? 'ሁሉም' : 'All' },
                    { id: 'online', label: 'Online' },
                    { id: 'shared_tech', label: 'Shared Tech' },
                    { id: 'bunna', label: 'Bunna' },
                    { id: 'tabs', label: 'Tabs' },
                    { id: 'spaces', label: 'Spaces' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveFilter(f.id)}
                      className={`px-2.5 py-1.5 rounded-xl border font-bold transition-all whitespace-nowrap ${
                        activeFilter === f.id
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {searchedUsers.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <p className="text-sm text-slate-300 font-bold">
                  {searchQuery || activeFilter !== 'all'
                    ? (isAm ? 'ምንም የሚስማማ ገንቢ አልተገኘም' : 'No developers matched your filters')
                    : (isAm ? 'በዚህ ምድብ ውስጥ የተመዘገበ ሰው የለም' : `No ${searchTarget === 'female' ? 'girlfriends' : 'boyfriends'} found.`)}
                </p>
                <p className="text-xs text-slate-500">
                  {searchQuery || activeFilter !== 'all' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveFilter('all');
                      }}
                      className="text-cyan-400 underline font-bold"
                    >
                      {isAm ? 'ፍለጋውን አጽዳ' : 'Clear search and filters'}
                    </button>
                  ) : (
                    isAm
                      ? 'መለያ በመመዝገብ አዳዲስ ሰዎችን ያግኙ ወይም በቅንብሮች ውስጥ የሚፈልጉትን ይቀይሩ!'
                      : 'Register cards to populate the network or change preference in Settings!'
                  )}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {searchedUsers.map((user) => {
                  const sharedTech = (user.techStack || []).filter((t) =>
                    (userProfile?.techStack || ['React', 'TypeScript']).includes(t)
                  );
                  const sameIndent =
                    user.indentation &&
                    userProfile?.indentation &&
                    user.indentation === userProfile.indentation;
                  const matchScore = Math.min(
                    99,
                    65 + sharedTech.length * 12 + (sameIndent ? 10 : 0)
                  );
                  const isFriend = myFriends.has(user.id);
                  const isLiked = likedUserIds.has(user.id);
                  const isWaved = wavedUserIds.has(user.id);
                  const unread = unreadCounts[user.id] || 0;

                  return (
                    <div
                      key={user.id}
                      className={`p-4 rounded-2xl bg-slate-900 border transition-all flex flex-col justify-between space-y-3 shadow-md ${
                        unread > 0
                          ? 'border-rose-500 shadow-rose-950/40 shadow-lg ring-1 ring-rose-500/40'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2.5">
                        {/* Header: Photo/Avatar, Name, Live/Offline status */}
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setInspectPeer(user)}
                            className="flex items-center gap-2.5 min-w-0 text-left group cursor-pointer"
                            title="Click to view full developer profile"
                          >
                            <div className="relative w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-cyan-500 transition-colors">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xl">
                                  {user.emoji || (user.gender === 'female' ? '👩‍💻' : '👨‍💻')}
                                </span>
                              )}
                              {user.isLiveNow && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5 group-hover:text-cyan-300 transition-colors">
                                <span>{user.name}</span>
                                {unread > 0 && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
                                    {unread} new
                                  </span>
                                )}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate">{user.handle}</p>
                            </div>
                          </button>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {user.isLiveNow ? (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>Live</span>
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-500 text-[10px]">
                                Offline
                              </span>
                            )}
                            <span className="text-[10px] text-cyan-400 font-bold">
                              {matchScore}% Match
                            </span>
                          </div>
                        </div>

                        {/* Special Quote or Bio */}
                        <p className="text-xs text-slate-300 line-clamp-2 italic">
                          "{user.quote || user.bio || 'Coding with passion...'}"
                        </p>

                        {/* Tech Stack Pills */}
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {(user.techStack || []).slice(0, 3).map((tech, idx) => (
                            <span
                              key={idx}
                              className={`text-[10px] px-1.5 py-0.5 rounded-md border ${
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

                      {/* Social Actions & Direct Chat (Works whether live or offline) */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <div className="grid grid-cols-3 gap-1 text-[11px]">
                          <button
                            type="button"
                            onClick={() => handleWave(user)}
                            className={`py-1 rounded-lg border text-center transition-colors ${
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
                            className={`py-1 rounded-lg border text-center transition-colors ${
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
                            className={`py-1 rounded-lg border text-center transition-colors ${
                              isFriend
                                ? 'bg-slate-800 border-slate-700 text-slate-200'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {isFriend ? 'Friend' : '+Friend'}
                          </button>
                        </div>

                        {/* Inspect Profile & Chat Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setInspectPeer(user)}
                            className="px-2.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-600 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 shrink-0"
                            title="Inspect Developer Profile & Stats"
                          >
                            <span>👤</span>
                            <span className="hidden sm:inline">Profile</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDirectChat(user)}
                            className={`flex-1 py-2 rounded-xl border font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm ${
                              unread > 0
                                ? 'bg-rose-950/90 border-rose-500 text-rose-200 hover:bg-rose-900 shadow-rose-950/50'
                                : 'bg-slate-950 hover:bg-slate-800 border-slate-800 hover:border-cyan-700 text-cyan-300'
                            }`}
                          >
                            <span>💬</span>
                            <span>{unread > 0 ? `Chat (${unread}) →` : `Chat with ${user.name} →`}</span>
                          </button>
                        </div>
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
          <div className="space-y-3 animate-fade-in pb-8">
            {friendsList.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <p className="text-sm text-slate-300">No friends added yet.</p>
                <p className="text-xs text-slate-500">
                  Click "+Friend" on any developer profile in Registered Peers to connect!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {friendsList.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-2.5 shadow-md"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                        {friend.avatarUrl ? (
                          <img src={friend.avatarUrl} alt={friend.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">{friend.emoji || '🧑‍💻'}</span>
                        )}
                      </div>
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
                        className="py-1 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-amber-300 hover:bg-slate-800"
                        title="Wave"
                      >
                        👋
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDirectChat(friend)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-bold text-xs text-center"
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
          <div className="space-y-3 animate-fade-in max-w-2xl mx-auto w-full pb-8">
            <form onSubmit={handlePostStatus} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 shadow-md">
              <textarea
                rows={2}
                value={newStatusText}
                onChange={(e) => setNewStatusText(e.target.value)}
                placeholder={isAm ? "ስለ ምን እያሰቡ ነው? ለምሳሌ: React ስሰራ ቡና ያስፈልገኛል ☕..." : "What are you coding or thinking? Share with the dev community..."}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Shared in real-time</span>
                <button
                  type="submit"
                  disabled={!newStatusText.trim()}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-bold disabled:opacity-40"
                >
                  Post Status
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {communityPosts.map((post) => (
                <div key={post.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 shadow-sm">
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

      {/* Inspect Partner Full Profile Modal */}
      <PartnerProfileModal
        isOpen={Boolean(inspectPeer)}
        onClose={() => setInspectPeer(null)}
        peer={inspectPeer}
        userProfile={userProfile}
        isOnline={inspectPeer?.isLiveNow}
        onSendBunna={() => inspectPeer && handleWave(inspectPeer)}
        onAddFriend={() => inspectPeer && handleToggleFriend(inspectPeer)}
        onLike={() => inspectPeer && handleLike(inspectPeer)}
        isFriend={inspectPeer ? myFriends.has(inspectPeer.id) : false}
        isLiked={inspectPeer ? likedUserIds.has(inspectPeer.id) : false}
        lang={lang}
      />
    </div>
  );
}