// ─────────────────────────────────────────────────────────────────────────────
// RealChatLobby.jsx — Social Developer Lobby: Real Matchmaking, Friends & Community Feed
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { wsService } from '../../services/websocket.js';
import { soundEngine } from '../../utils/audio.js';

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
  const [searchTarget, setSearchTarget] = useState('female'); // 'female' (GF) | 'male' (BF)
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'friends' | 'feed'

  // Social interactions state
  const [myFriends, setMyFriends] = useState(() => new Set(userProfile?.friends || []));
  const [likedUserIds, setLikedUserIds] = useState(new Set());
  const [wavedUserIds, setWavedUserIds] = useState(new Set());
  const [communityPosts, setCommunityPosts] = useState([]);
  const [newStatusText, setNewStatusText] = useState('');
  const [socialToast, setSocialToast] = useState(null);

  const isAm = lang === 'am';

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

    // Load initial community posts from backend database
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

    const unbindAnnouncement = wsService.on('community:announcement', (data) => {
      showSocialToast(data.announcement || data.message || '🎉 Someone joined the community!');
      soundEngine.playMessageBeep();
    });

    const unbindSocialAction = wsService.on('social:action', (data) => {
      if (data.targetUserId === userProfile?.id) {
        if (data.action === 'wave') {
          showSocialToast(`👋 ${data.fromUser?.name || 'A developer'} just sent you a coffee wave!`);
          soundEngine.playRomanticChime();
        } else if (data.action === 'like') {
          showSocialToast(`💖 ${data.fromUser?.name || 'A developer'} liked your dev profile!`);
          soundEngine.playHeartbeat();
        } else if (data.action === 'add_friend') {
          showSocialToast(`👥 ${data.fromUser?.name || 'A developer'} added you to their friends!`);
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

  function handleInstantMatch() {
    soundEngine.playHeartbeat();
    setIsMatching(true);
    wsService.findMatch(searchTarget);
  }

  function handleDirectChat(peer) {
    soundEngine.playRomanticChime();
    wsService.startDirectChat(peer);
  }

  function handleWave(user) {
    soundEngine.playRomanticChime();
    setWavedUserIds((prev) => new Set([...prev, user.id]));
    wsService.sendSocialAction('wave', user.id);
    showSocialToast(
      isAm ? `👋 ለ ${user.name} የቡና ሰላምታ ላኩ!` : `👋 You sent a warm coffee wave to ${user.name}!`
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
        isAm ? `👥 ${user.name} አሁን የጓደኞችዎ ዝርዝር ውስጥ ገብቷል!` : `👥 ${user.name} added to your developer friends!`
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
      showSocialToast(isAm ? '🚀 ሀሳብዎ በዳታቤዝ ተለጥፏል!' : '🚀 Your developer status has been posted!');
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col overflow-y-auto">
      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 4px)",
        }}
      />

      {/* Floating Real-Time Social Toast */}
      {socialToast && (
        <div className="fixed top-16 right-4 sm:right-6 z-50 animate-bounce-in max-w-sm p-3.5  bg-slate-900 border border-cyan-500 shadow-2xl text-xs font-mono text-cyan-200 flex items-center gap-2.5">
          <span className="w-2 h-2  bg-cyan-400 animate-ping" />
          <span className="flex-1 font-bold">{socialToast}</span>
          <button onClick={() => setSocialToast(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      <div className="relative z-20 flex flex-col flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Top Header: Back button + Live WS status + Profile */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToModeSelect}
              className="px-3 py-1.5  border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300 hover:text-white font-mono text-xs flex items-center gap-1.5 transition-all"
            >
              <span>←</span>
              <span>{isAm ? "ማውጫ" : "Exit"}</span>
            </button>

            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 ">
              <span className={`w-2 h-2  ${connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-mono text-[11px] text-slate-300">
                {connectionStatus === 'connected'
                  ? (isSimulated ? 'Peer Mesh' : 'WebSocket')
                  : 'Connecting...'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenRegister}
              className="flex items-center gap-2 font-mono text-xs px-3.5 py-1.5  bg-cyan-950 border border-cyan-600 hover:bg-cyan-900 text-cyan-200 transition-all shadow-md"
              title="Register / Edit Developer Dating Card"
            >
              <span className="font-bold">{isAm ? "የፍቅር ካርዴ" : "My Card"}</span>
            </button>

            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-2 font-mono text-xs px-3 py-1.5  bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all"
              title="Audio & Profile Settings"
            >
              <span>{userProfile?.emoji || '🧑‍💻'}</span>
              <span className="font-bold hidden sm:inline">{userProfile?.name || 'Profile'}</span>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-2 pt-1">
          <h1 className="font-mono text-3xl sm:text-4xl font-black text-white">
            {isAm ? "ከእውነተኛ ገንቢ ጓደኞች ጋር ተገናኙ" : "Chat, Match & Interact with Dev Friends"}
          </h1>
        </div>

        {/* My Registered Developer Dating Card Banner */}
        <div className="p-4 sm:p-5  bg-slate-900/90 border border-slate-700/80 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-2  bg-slate-950 border border-cyan-800/80 shadow">
                {userProfile?.emoji || '🧑‍💻'}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-sm sm:text-base font-black text-white">
                    {userProfile?.name || 'Developer'}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">{userProfile?.handle || '@me'}</span>
                  <span className="text-[10px] px-2 py-0.5  bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold">
                    {userProfile?.isRegistered ? '✓ Registered in Database' : 'Guest Profile'}
                  </span>
                </div>
                <p className="font-mono text-xs text-slate-400 mt-0.5">
                  "{userProfile?.bio || (isAm ? "ስለ ራስዎ አልተመዘገበም... ካርድዎን አሁን ይመዝግቡ!" : "Tell others about yourself and your tech passion...")}"
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-4 py-2  bg-cyan-950 hover:bg-cyan-900 border border-cyan-600 text-cyan-300 font-mono text-xs font-bold transition-all shadow flex items-center justify-center gap-2 shrink-0"
            >
              <span>{isAm ? "የፍቅር ካርድዎን ይመዝግቡ / ያሻሽሉ" : "Register / Edit Dating Card"}</span>
            </button>
          </div>

          {/* Registered Criteria Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-fuchsia-300 font-bold flex items-center gap-1">
              <span>{userProfile?.lookingFor === 'male' ? '👨‍💻' : '👩‍💻'}</span>
              <span>Looking for: {userProfile?.lookingFor === 'male' ? 'Boyfriend' : 'Girlfriend'}</span>
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-bold flex items-center gap-1">
              <span>{userProfile?.indentation || 'Tabs'}</span>
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 font-bold flex items-center gap-1">
              <span>{userProfile?.drink || '☕ Bunna'}</span>
            </span>

            {userProfile?.location && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1">
                <span>{userProfile.location}</span>
              </span>
            )}

            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-slate-500 text-[10px]">Stack:</span>
              {(userProfile?.techStack || ['React', 'TypeScript']).map((tech, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-800/80 text-cyan-300 font-bold text-[10px]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Tabs: Discover vs Friends vs Community Feed */}
        <div className="flex items-center justify-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('discover')}
            className={`font-mono text-xs font-bold px-4 py-2  transition-all flex items-center gap-2 ${
              activeTab === 'discover'
                ? 'bg-slate-900 border border-cyan-600 text-cyan-300 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🌟</span>
            <span>{isAm ? "አዳዲስ ገንቢዎችን ፈልግ" : "Discover Developers"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('friends')}
            className={`font-mono text-xs font-bold px-4 py-2  transition-all flex items-center gap-2 ${
              activeTab === 'friends'
                ? 'bg-slate-900 border border-indigo-600 text-indigo-300 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>👥</span>
            <span>{isAm ? "ጓደኞቼ" : "My Friends & Connections"}</span>
            <span className="px-1.5 py-0.2  bg-slate-800 text-[10px] text-slate-300">
              {friendsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feed')}
            className={`font-mono text-xs font-bold px-4 py-2  transition-all flex items-center gap-2 ${
              activeTab === 'feed'
                ? 'bg-slate-900 border border-fuchsia-600 text-fuchsia-300 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>💬</span>
            <span>{isAm ? "የማህበረሰብ ሀሳቦች" : "Dev Social Feed"}</span>
          </button>
        </div>

        {/* ── TAB 1: DISCOVER ───────────────────────────────────────────────── */}
        {activeTab === 'discover' && (
          <div className="space-y-5 animate-fade-in">
            {/* Target Switcher: Looking for Girlfriend vs Boyfriend */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playRomanticChime();
                  setSearchTarget('female');
                }}
                className={`w-full sm:w-auto px-6 py-3  font-mono text-xs font-bold border-2 transition-all flex items-center justify-center gap-2.5 shadow-lg ${
                  searchTarget === 'female'
                    ? 'bg-fuchsia-950/90 border-fuchsia-500 text-fuchsia-200 shadow-fuchsia-950/50 scale-105'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-xl">👩‍💻</span>
                <span>{isAm ? "የሴት ጓደኛ ፈልግ (Find a Girlfriend)" : "Find a Girlfriend 👩‍💻"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playRomanticChime();
                  setSearchTarget('male');
                }}
                className={`w-full sm:w-auto px-6 py-3  font-mono text-xs font-bold border-2 transition-all flex items-center justify-center gap-2.5 shadow-lg ${
                  searchTarget === 'male'
                    ? 'bg-cyan-950/90 border-cyan-500 text-cyan-200 shadow-cyan-950/50 scale-105'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-xl">👨‍💻</span>
                <span>{isAm ? "የወንድ ጓደኛ ፈልግ (Find a Boyfriend)" : "Find a Boyfriend 👨‍💻"}</span>
              </button>
            </div>

            {/* Instant Match Action Box */}
            <div className="p-6  bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-slate-900 border border-indigo-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-mono text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                  <span>{isAm ? "ፈጣን የነፍስ ጓደኛ ማዛመጃ" : "Instant Soulmate Auto-Match"}</span>
                </h3>
              </div>

              <button
                type="button"
                onClick={handleInstantMatch}
                disabled={isMatching}
                className="w-full sm:w-auto px-6 py-3  bg-emerald-950 hover:bg-emerald-900 border border-emerald-600 text-emerald-300 font-mono text-xs font-bold transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{isMatching ? '⏳' : '💖'}</span>
                <span>{isMatching ? (isAm ? 'እየፈለገ ነው...' : 'Finding Match...') : (isAm ? 'አሁን አዛምድ' : 'Start Instant Match')}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            {/* Online Developers Grid */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => {
                  const sharedTech = (user.techStack || []).filter((t) =>
                    (userProfile?.techStack || ['React', 'TypeScript']).includes(t)
                  );
                  const sameIndent = user.indentation && userProfile?.indentation && user.indentation === userProfile.indentation;
                  const matchScore = Math.min(98, 65 + sharedTech.length * 12 + (sameIndent ? 10 : 0));
                  const isFriend = myFriends.has(user.id);
                  const isLiked = likedUserIds.has(user.id);
                  const isWaved = wavedUserIds.has(user.id);

                  return (
                    <div
                      key={user.id}
                      className="p-5  bg-slate-900 border border-slate-800 hover:border-cyan-800/80 transition-all flex flex-col justify-between space-y-4 group shadow-md"
                    >
                      <div className="space-y-3">
                        {/* Avatar & Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl p-2  bg-slate-950 border border-slate-800">
                              {user.emoji || (user.gender === 'female' ? '👩‍💻' : '👨‍💻')}
                            </span>
                            <div>
                              <h4 className="font-mono text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                                {user.name}
                              </h4>
                              <p className="font-mono text-[11px] text-slate-500">{user.handle}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 px-2 py-0.5  bg-emerald-950/80 border border-emerald-800 text-[10px] font-mono text-emerald-400 font-bold">
                            <span className="w-1.5 h-1.5  bg-emerald-400 animate-pulse" />
                            <span>Online</span>
                          </div>
                        </div>

                        {/* Criteria Match Badge */}
                        <div className="p-2  bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-cyan-300 font-bold flex items-center gap-1">
                            <span>✨</span>
                            <span>{matchScore}% Match</span>
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {sharedTech.length > 0 ? `Shared: ${sharedTech.join(', ')}` : (user.indentation || 'Tabs')}
                          </span>
                        </div>

                        {/* Bio */}
                        <p className="font-mono text-xs text-slate-300 leading-relaxed">
                          "{user.bio}"
                        </p>

                        {/* Location & Tech stack */}
                        <div className="space-y-1.5 pt-1">
                          {user.location && (
                            <p className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                              <span>📍</span>
                              <span>{user.location}</span>
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {(user.techStack || []).map((tech, idx) => (
                              <span
                                key={idx}
                                className={`font-mono text-[10px] px-2 py-0.5 rounded-md border ${
                                  sharedTech.includes(tech)
                                    ? 'bg-cyan-950/80 border-cyan-700 text-cyan-300 font-bold'
                                    : 'bg-slate-950 border-slate-800 text-slate-400'
                                }`}
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Social Actions: Wave, Like, Friend */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <div className="grid grid-cols-3 gap-1.5">
                          {/* Wave */}
                          <button
                            type="button"
                            onClick={() => handleWave(user)}
                            className={`py-1.5 rounded-lg border text-[11px] font-mono flex items-center justify-center gap-1 transition-all ${
                              isWaved
                                ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-amber-300'
                            }`}
                            title="Send coffee wave"
                          >
                            <span>👋</span>
                            <span>{isWaved ? 'Waved' : 'Wave'}</span>
                          </button>

                          {/* Like */}
                          <button
                            type="button"
                            onClick={() => handleLike(user)}
                            className={`py-1.5 rounded-lg border text-[11px] font-mono flex items-center justify-center gap-1 transition-all ${
                              isLiked
                                ? 'bg-fuchsia-950/80 border-fuchsia-600 text-fuchsia-300'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-fuchsia-300'
                            }`}
                            title="Like developer profile"
                          >
                            <span>💖</span>
                            <span>{user.likes + (isLiked ? 1 : 0)}</span>
                          </button>

                          {/* Add Friend */}
                          <button
                            type="button"
                            onClick={() => handleToggleFriend(user)}
                            className={`py-1.5 rounded-lg border text-[11px] font-mono flex items-center justify-center gap-1 transition-all ${
                              isFriend
                                ? 'bg-indigo-950/80 border-indigo-600 text-indigo-300'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-indigo-300'
                            }`}
                            title="Add as Friend"
                          >
                            <span>👥</span>
                            <span>{isFriend ? 'Friend' : '+Friend'}</span>
                          </button>
                        </div>

                        {/* Start Live Chat CTA */}
                        <button
                          type="button"
                          onClick={() => handleDirectChat(user)}
                          className="w-full py-2.5  bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-200 font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
                        >
                          <span>💬</span>
                          <span>{isAm ? "ውይይት ጀምር" : "Start Live Chat"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: MY FRIENDS & CONNECTIONS ───────────────────────────────── */}
        {activeTab === 'friends' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-sm font-bold text-white flex items-center gap-2">
                <span>👥</span>
                <span>{isAm ? "የእኔ የገንቢ ጓደኞች" : "My Developer Friends"}</span>
                <span className="text-slate-500 font-normal">({friendsList.length})</span>
              </h2>
            </div>

            {friendsList.length === 0 ? (
              <div className="p-8  bg-slate-900 border border-slate-800 text-center space-y-3">
                <span className="text-4xl block">🤝</span>
                <h3 className="font-bold text-white text-base">
                  {isAm ? "እስካሁን ምንም ጓደኛ አልጨመሩም" : "No Friends Added Yet"}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {isAm
                    ? "ከላይ ባለው 'አዳዲስ ገንቢዎችን ፈልግ' ማውጫ ውስጥ የሚወዷቸውን ገንቢዎች +Friend በመጫን ጓደኛ ያድርጉ!"
                    : "Go to the Discover tab and click '+Friend' or 'Wave 👋' on any developer card to grow your circle!"}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('discover')}
                  className="px-5 py-2.5  bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold text-xs"
                >
                  Discover Developers →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friendsList.map((friend) => (
                  <div
                    key={friend.id}
                    className="p-4  bg-slate-900 border border-indigo-900/60 shadow flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2  bg-slate-950 border border-indigo-800">
                        {friend.emoji || '🧑‍💻'}
                      </span>
                      <div>
                        <h4 className="font-bold text-white text-sm">{friend.name}</h4>
                        <p className="text-xs text-slate-500">{friend.handle}</p>
                        <span className="text-[10px] text-emerald-400 font-bold">🟢 Connected Friend</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2">"{friend.bio}"</p>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleWave(friend)}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-amber-300 hover:bg-slate-800"
                        title="Wave"
                      >
                        👋
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDirectChat(friend)}
                        className="flex-1 py-2  bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 font-bold text-xs flex items-center justify-center gap-1.5"
                      >
                        <span>💬</span>
                        <span>Chat Now</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: DEV SOCIAL FEED ────────────────────────────────────────── */}
        {activeTab === 'feed' && (
          <div className="space-y-4 animate-fade-in max-w-2xl mx-auto w-full">
            {/* Status Composer */}
            <form onSubmit={handlePostStatus} className="p-4  bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{userProfile?.emoji || '🧑‍💻'}</span>
                <span className="font-bold text-xs text-slate-300">
                  {userProfile?.name || 'Developer'} — {isAm ? "ሀሳብዎን ያጋሩ" : "Share dev status / coffee craving:"}
                </span>
              </div>

              <textarea
                rows={2}
                value={newStatusText}
                onChange={(e) => setNewStatusText(e.target.value)}
                placeholder={
                  isAm
                    ? "ስለ ምን እየሰሩ ነው? ለምሳሌ: ማታ ማታ React ስሰራ ቡና በጣም አስፈልጎኛል ☕..."
                    : "What are you coding or thinking? e.g. Just deployed with zero errors, need coffee ☕..."
                }
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500  p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
              />

              {/* Quick Pills */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1 flex-wrap">
                  {['☕ Fueling Bunna', '🚀 Deployed to main', '🐛 Hunting bugs', '💖 Looking for soulmate'].map((pill, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewStatusText(pill)}
                      className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-400 hover:text-white"
                    >
                      {pill}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={!newStatusText.trim()}
                  className="px-4 py-2  bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-bold text-xs disabled:opacity-40"
                >
                  Post 🚀
                </button>
              </div>
            </form>

            {/* Posts Feed */}
            <div className="space-y-3 pt-2">
              {communityPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-4  bg-slate-900 border border-slate-800 shadow space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1  bg-slate-950 border border-slate-800">
                        {post.authorEmoji || '🧑‍💻'}
                      </span>
                      <div>
                        <h4 className="font-bold text-white text-xs">{post.authorName}</h4>
                        <p className="text-[10px] text-slate-500">{post.authorHandle}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed pl-1">
                    {post.content}
                  </p>

                  <div className="flex items-center gap-3 pt-1 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playHeartbeat();
                        setCommunityPosts((prev) =>
                          prev.map((p) => p.id === post.id ? { ...p, likes: p.likes + 1 } : p)
                        );
                      }}
                      className="hover:text-fuchsia-400 flex items-center gap-1 transition-colors"
                    >
                      <span>💖</span>
                      <span>{post.likes}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playRomanticChime();
                        showSocialToast(`☕ Sent coffee love to ${post.authorName}!`);
                      }}
                      className="hover:text-amber-400 flex items-center gap-1 transition-colors"
                    >
                      <span>☕</span>
                      <span>Cheer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
