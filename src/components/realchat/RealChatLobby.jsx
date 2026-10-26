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
  onUpdateUserProfile,
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
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'online' | 'friends' | 'following' | 'shared_tech' | 'bunna' | 'tabs' | 'spaces'
  const [inspectPeer, setInspectPeer] = useState(null);

  // Locked strictly to user's registered target preference
  const searchTarget = userProfile?.lookingFor === 'male' ? 'male' : 'female';

  // Social interactions state: robustly synced with backend database
  const [myFriends, setMyFriends] = useState(() => new Set(userProfile?.friends || []));
  const [followingUserIds, setFollowingUserIds] = useState(() => new Set(userProfile?.following || []));
  const [likedUserIds, setLikedUserIds] = useState(() => new Set(userProfile?.likedBy || []));
  const [wavedUserIds, setWavedUserIds] = useState(new Set());
  const [requestedUserIds, setRequestedUserIds] = useState(new Set());
  const [communityPosts, setCommunityPosts] = useState([]);
  const [newStatusText, setNewStatusText] = useState('');
  const [socialToast, setSocialToast] = useState(null);

  const isAm = lang === 'am';

  // Keep state updated when userProfile prop updates
  useEffect(() => {
    if (userProfile) {
      if (Array.isArray(userProfile.friends)) setMyFriends(new Set(userProfile.friends));
      if (Array.isArray(userProfile.following)) setFollowingUserIds(new Set(userProfile.following));
    }
  }, [userProfile?.friends, userProfile?.following]);

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

    // Fetch initial friend requests status
    if (userProfile?.id) {
      wsService.fetchNotifications(userProfile.id).then((notifs) => {
        if (Array.isArray(notifs)) {
          const reqs = notifs
            .filter((n) => n.fromUser?.id === userProfile.id && n.type === 'friend_request' && n.status === 'pending')
            .map((n) => n.targetUserId);
          setRequestedUserIds(new Set(reqs));
        }
      });
    }

    // Fetch ALL registered users from backend database on mount & synchronize current user's profile
    wsService.fetchRegisteredUsers().then((users) => {
      if (users && users.length > 0) {
        setDbUsers(users);
        if (userProfile?.id) {
          const freshMe = users.find((u) => u.id === userProfile.id);
          if (freshMe) {
            if (Array.isArray(freshMe.friends)) {
              setMyFriends(new Set(freshMe.friends));
            }
            if (Array.isArray(freshMe.following)) {
              setFollowingUserIds(new Set(freshMe.following));
            }
            onUpdateUserProfile?.({ ...userProfile, ...freshMe });
          }
        }
      }
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

    const unbindFriendResponse = wsService.on('notification:new', (notif) => {
      if (notif?.targetUserId !== userProfile?.id) return;
      if (notif.type === 'friend_accept' && notif.fromUser?.id) {
        setRequestedUserIds((prev) => {
          const next = new Set(prev);
          next.delete(notif.fromUser.id);
          return next;
        });
        setMyFriends((prev) => new Set([...prev, notif.fromUser.id]));
      } else if (notif.type === 'friend_decline' && notif.fromUser?.id) {
        setRequestedUserIds((prev) => {
          const next = new Set(prev);
          next.delete(notif.fromUser.id);
          return next;
        });
      }
    });

    // Listen to real-time live social actions (likes, follows, friend confirmations)
    const unbindSocialAction = wsService.on('social:action', (data) => {
      if (data.targetUser?.id) {
        setDbUsers((prev) =>
          prev.map((u) => (u.id === data.targetUser.id ? { ...u, ...data.targetUser } : u))
        );
      }
      if (data.actor?.id && data.actor.id === userProfile?.id) {
        if (Array.isArray(data.actor.friends)) setMyFriends(new Set(data.actor.friends));
        if (Array.isArray(data.actor.following)) setFollowingUserIds(new Set(data.actor.following));
        onUpdateUserProfile?.({ ...userProfile, ...data.actor });
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
      unbindFriendResponse();
      unbindSocialAction();
      unbindNewPost();
    };
  }, [userProfile?.id, searchTarget]);

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
    if (activeFilter === 'friends') return myFriends.has(u.id) || (userProfile?.friends && userProfile.friends.includes(u.id));
    if (activeFilter === 'following') return followingUserIds.has(u.id);
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

  async function handleToggleFollow(user) {
    if (!userProfile?.isRegistered) {
      soundEngine.playHeartbeat();
      showSocialToast(isAm ? 'እባክዎ መጀመሪያ ይመዝገቡ' : 'Please register to follow developers');
      onOpenRegister?.(user.gender);
      return;
    }
    soundEngine.playRomanticChime();
    const isFollowing = followingUserIds.has(user.id);
    const nextFollowing = new Set(followingUserIds);
    if (isFollowing) {
      nextFollowing.delete(user.id);
      showSocialToast(isAm ? `የ ${user.name} መከታተል አቆሙ` : `Unfollowed ${user.name}`);
    } else {
      nextFollowing.add(user.id);
      showSocialToast(isAm ? `የ ${user.name} ተከታይ ሆኑ 🌟` : `Following ${user.name} 🌟`);
    }
    setFollowingUserIds(nextFollowing);
    const result = await wsService.sendSocialAction('follow', user.id);
    if (result?.targetUser) {
      setDbUsers((prev) =>
        prev.map((u) => (u.id === result.targetUser.id ? { ...u, ...result.targetUser } : u))
      );
    }
    if (result?.actor) {
      onUpdateUserProfile?.({ ...userProfile, ...result.actor });
    }
  }

  async function handleLike(user) {
    if (!userProfile?.isRegistered) {
      soundEngine.playHeartbeat();
      showSocialToast(isAm ? 'እባክዎ መጀመሪያ ይመዝገቡ' : 'Please register to send likes');
      onOpenRegister?.(user.gender);
      return;
    }
    soundEngine.playHeartbeat();
    const isLiked = likedUserIds.has(user.id);
    const nextLiked = new Set(likedUserIds);
    if (isLiked) {
      nextLiked.delete(user.id);
    } else {
      nextLiked.add(user.id);
    }
    setLikedUserIds(nextLiked);
    const result = await wsService.sendSocialAction('like', user.id);
    if (result?.targetUser) {
      setDbUsers((prev) =>
        prev.map((u) => (u.id === result.targetUser.id ? { ...u, ...result.targetUser } : u))
      );
    }
    showSocialToast(
      isLiked ? `Removed like for ${user.name}` : `❤️ Sent developer love to ${user.name}!`
    );
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
    <div className="min-h-full bg-black text-white font-sans flex flex-col p-3 sm:p-5 select-text overflow-y-auto">
      {/* Toast Notification */}
      {socialToast && (
        <div className="fixed top-14 right-4 z-50 p-3  bg-zinc-950 border border-red-500 shadow-2xl text-xs text-white flex items-center gap-2 animate-slide-up">
          <span className="w-2 h-2  bg-red-500 animate-ping" />
          <span className="font-bold">{socialToast}</span>
          <button onClick={() => setSocialToast(null)} className="text-zinc-400 hover:text-white ml-1">✕</button>
        </div>
      )}

      <div className="max-w-5xl mx-auto w-full space-y-4">

        {/* Clean Segmented Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className={`px-3.5 py-1.5  text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'discover'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <span>Registered Peers</span>
            <span className="px-1.5 py-0.2 rounded bg-black/60 text-[10px] text-zinc-300 font-mono">
              {filteredUsers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('friends')}
            className={`px-3.5 py-1.5  text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'friends'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <span>👥 Friends</span>
            <span className="px-1.5 py-0.2 rounded bg-black/60 text-[10px] text-zinc-300 font-mono">
              {friendsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feed')}
            className={`px-3.5 py-1.5  text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'feed'
                ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <span>Dev Feed</span>
            <span className="px-1.5 py-0.2 rounded bg-black/60 text-[10px] text-zinc-300 font-mono">
              {communityPosts.length}
            </span>
          </button>
        </div>

        {/* ── TAB 1: ALL REGISTERED & ONLINE PEERS ── */}
        {activeTab === 'discover' && (
          <div className="space-y-3.5 animate-fade-in pb-8">
            {/* Search Input & Filter Chips */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isAm
                        ? 'በስም፣ በቴክኖሎጂ፣ በቦታ ወይም በመግለጫ ፈልግ...'
                        : 'Search by name, tech stack, bio, location...'
                    }
                    className="w-full pl-8 pr-8 py-2 bg-zinc-950 border border-zinc-800 focus:border-red-500  text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-xs text-zinc-400 hover:text-white"
                      title="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] shrink-0 font-mono">
                  {[
                    { id: 'all', label: isAm ? 'ሁሉም' : 'All' },
                    { id: 'online', label: 'Live Now' },
                    { id: 'friends', label: `Friends (${friendsList.length})` },
                    { id: 'following', label: `Following (${followingUserIds.size})` },
                    { id: 'shared_tech', label: 'Shared Tech' },
                    { id: 'bunna', label: 'Bunna' },
                    { id: 'tabs', label: 'Tabs' },
                    { id: 'spaces', label: 'Spaces' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveFilter(f.id)}
                      className={`px-3 py-1.5  border font-bold transition-all whitespace-nowrap ${
                        activeFilter === f.id
                          ? 'bg-red-600 border-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {searchedUsers.length === 0 ? (
              <div className="p-8  bg-zinc-950 border border-zinc-800 text-center space-y-2">
                <p className="text-sm text-zinc-300 font-bold">
                  {searchQuery || activeFilter !== 'all'
                    ? (isAm ? 'ምንም የሚስማማ ገንቢ አልተገኘም' : 'No developers matched your filters')
                    : (isAm ? 'በዚህ ምድብ ውስጥ የተመዘገበ ሰው የለም' : `No ${searchTarget === 'female' ? 'girlfriends' : 'boyfriends'} found.`)}
                </p>
                <p className="text-xs text-zinc-500">
                  {searchQuery || activeFilter !== 'all' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setActiveFilter('all');
                      }}
                      className="text-red-400 underline font-bold"
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
                  const isFollowing = followingUserIds.has(user.id);
                  const isLiked = likedUserIds.has(user.id);
                  const isWaved = wavedUserIds.has(user.id);
                  const isRequested = requestedUserIds.has(user.id);
                  const unread = unreadCounts[user.id] || 0;
                  const followerCount = Array.isArray(user.followers) ? user.followers.length : 0;

                  return (
                    <div
                      key={user.id}
                      className={`p-4 sm:p-5  bg-zinc-950 border transition-all flex flex-col justify-between space-y-3.5 shadow-xl hover:shadow-2xl hover:shadow-red-950/20 ${
                        unread > 0
                          ? 'border-red-500 shadow-red-950/50 ring-2 ring-red-500/50'
                          : 'border-zinc-800/90 hover:border-red-600/70'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Header: Avatar, Name, Handle & Live Status */}
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setInspectPeer(user)}
                            className="flex items-center gap-3 min-w-0 text-left group cursor-pointer flex-1"
                            title="Click to view full developer profile"
                          >
                            <div className="relative w-12 h-12 sm:w-14 sm:h-14  bg-black border-2 border-zinc-800 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-red-500 transition-colors shadow-md">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-2xl sm:text-3xl">
                                  {user.emoji || (user.gender === 'female' ? '👩‍💻' : '👨‍💻')}
                                </span>
                              )}
                              {user.isLiveNow && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3  bg-red-500 ring-2 ring-black animate-pulse" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-bold text-white truncate flex items-center gap-1.5 group-hover:text-red-400 transition-colors">
                                <span>{user.name}</span>
                                {unread > 0 && (
                                  <span className="px-1.5 py-0.2  bg-red-600 text-white text-[9px] font-black animate-pulse">
                                    {unread} new
                                  </span>
                                )}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-1">
                                <span>{followerCount} followers</span>
                                <span>·</span>
                                <span>likes {user.likes || 1}</span>
                              </div>
                            </div>
                          </button>

                          <div className="shrink-0 flex flex-col items-end">
                            {user.isLiveNow ? (
                              <span className="flex items-center gap-1 px-2.5 py-1  bg-red-950/80 border border-red-600/70 text-red-300 text-[10px] font-bold shadow-sm">
                                <span>Live Now</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5  bg-zinc-900 border border-zinc-800 text-zinc-500 text-[10px] font-mono">
                                Offline
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Special Quote / Bio snippet */}
                        <div className="p-2.5  text-zinc-300 italic leading-relaxed">
                          "{user.quote || user.bio || 'Coding with passion...'}"
                        </div>
                      </div>

                      {/* Social Actions & Direct Chat Toolbar */}
                      <div className="space-y-2 pt-2 border-t border-zinc-800/80 font-mono">
                        <div className="grid grid-cols-4 gap-1 text-[11px]">
                          {/* Follow Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleFollow(user)}
                            className={`py-1.5  border text-center transition-colors font-bold ${
                              isFollowing
                                ? 'bg-zinc-900 border-red-600 text-red-400 shadow-sm'
                                : 'bg-black border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                            }`}
                            title="Follow developer"
                          >
                            {isFollowing ? '✓ Following' : '+ Follow'}
                          </button>

                          {/* Wave Button */}
                          <button
                            type="button"
                            onClick={() => handleWave(user)}
                            className={`py-1.5  border text-center transition-colors font-bold ${
                              isWaved
                                ? 'bg-zinc-900 border-zinc-700 text-red-400'
                                : 'bg-black border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                            }`}
                            title="Wave to break the ice"
                          >
                            {isWaved ? 'Waved' : 'Wave'}
                          </button>

                          {/* Friend Button */}
                          <button
                            type="button"
                            disabled={isRequested}
                            onClick={() => handleToggleFriend(user)}
                            className={`py-1.5  border text-center transition-colors font-bold ${
                              isFriend
                                ? 'bg-zinc-800 border-zinc-600 text-white'
                                : isRequested
                                ? 'bg-amber-950/40 border-amber-600/50 text-amber-300 opacity-80 cursor-not-allowed'
                                : 'bg-black border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                            }`}
                            title="Add as developer friend"
                          >
                            {isFriend ? '✓ Friend' : isRequested ? '⏳ Req' : '+ Friend'}
                          </button>
                        </div>

                        {/* Inspect Profile & Chat Action Buttons */}
                        <div className="flex items-center gap-2 pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleDirectChat(user)}
                            className={`flex-1 py-2.5 px-3  border font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] ${
                              unread > 0
                                ? 'bg-red-600 hover:bg-red-500 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse'
                                : 'bg-red-600 hover:bg-red-500 border-red-500 text-white shadow-red-950/40'
                            }`}
                          >
                            <span>{unread > 0 ? `Chat (${unread} New) ➔` : `Chat`}</span>
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

        {/* ── TAB 2: CONFIRMED FRIENDS ────────────────────────────────────── */}
        {activeTab === 'friends' && (
          <div className="space-y-3 animate-fade-in pb-8">
            {friendsList.length === 0 ? (
              <div className="p-8  bg-zinc-950 border border-zinc-800 text-center space-y-2">
                <span className="text-3xl">👥</span>
                <p className="text-sm text-white font-bold">No confirmed friends yet.</p>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Click "+ Friend" on any developer profile in Registered Peers. When they accept your request, they will appear right here!
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('discover')}
                  className="px-4 py-2  bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Explore Developers
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {friendsList.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-4  bg-zinc-950 border border-zinc-800 flex flex-col justify-between space-y-3 shadow-xl hover:border-red-600/60 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11  bg-black border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                        {friend.avatarUrl ? (
                          <img src={friend.avatarUrl} alt={friend.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">{friend.emoji || '🧑‍💻'}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white truncate">{friend.name}</h4>
                          <span className="px-2 py-0.5  bg-zinc-800 text-[10px] text-zinc-300 font-mono font-bold">
                            ✓ Friend
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-mono">{friend.handle}</p>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 line-clamp-2 italic">"{friend.bio}"</p>

                    <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80 font-mono">
                      <button
                        type="button"
                        onClick={() => handleWave(friend)}
                        className="py-1.5 px-3  bg-black border border-zinc-800 text-xs text-amber-300 hover:bg-zinc-900"
                        title="Wave"
                      >
                        👋
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDirectChat(friend)}
                        className="flex-1 py-2 px-3  bg-red-600 hover:bg-red-500 border border-red-500 text-white font-bold text-xs text-center shadow-sm transition-all"
                      >
                        Chat Now →
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
            <form onSubmit={handlePostStatus} className="p-4  bg-zinc-950 border border-zinc-800 space-y-3 shadow-xl">
              <textarea
                rows={2}
                value={newStatusText}
                onChange={(e) => setNewStatusText(e.target.value)}
                placeholder={isAm ? "ስለ ምን እያሰቡ ነው? ለምሳሌ: React ስሰራ ቡና ያስፈልገኛል ☕..." : "What are you coding or thinking? Share with the dev community..."}
                className="w-full bg-black border border-zinc-800 focus:border-red-500  p-3 text-xs text-white placeholder:text-zinc-600 focus:outline-none"
              />
              <div className="flex items-center justify-between font-mono">
                <span className="text-[11px] text-zinc-500">Shared across real-time dev feed</span>
                <button
                  type="submit"
                  disabled={!newStatusText.trim()}
                  className="px-4 py-1.5  bg-red-600 hover:bg-red-500 text-white text-xs font-bold disabled:opacity-40 transition-all shadow-sm"
                >
                  Post Status
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {communityPosts.map((post) => (
                <div key={post.id} className="p-4  bg-zinc-950 border border-zinc-800 space-y-2 shadow-sm font-sans">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{post.authorEmoji || '🧑‍💻'}</span>
                      <span className="text-xs font-bold text-white">{post.authorName}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 pl-1">{post.content}</p>
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
        onFollow={() => inspectPeer && handleToggleFollow(inspectPeer)}
        isFriend={inspectPeer ? myFriends.has(inspectPeer.id) : false}
        isFollowing={inspectPeer ? followingUserIds.has(inspectPeer.id) : false}
        isRequested={inspectPeer ? requestedUserIds.has(inspectPeer.id) : false}
        isLiked={inspectPeer ? likedUserIds.has(inspectPeer.id) : false}
        lang={lang}
      />
    </div>
  );
}