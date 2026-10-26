// ─────────────────────────────────────────────────────────────────────────────
// NotificationCenterModal.jsx — Developer Social Media Notification Center
// Red, Black & White developer theme with real friends, followers, likes, & alerts
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { soundEngine } from '../../utils/audio.js';
import { wsService } from '../../services/websocket.js';

export default function NotificationCenterModal({
  isOpen,
  onClose,
  notifications = [],
  onUpdateNotifications,
  userProfile,
  onUpdateUserProfile,
  onOpenChatWithPeer,
  onInspectProfile,
  lang = 'en',
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'requests' | 'social'
  const isAm = lang === 'am';

  const friendCount = userProfile?.friends?.length || 0;
  const followerCount = Array.isArray(userProfile?.followers) ? userProfile.followers.length : 0;
  const followingCount = Array.isArray(userProfile?.following) ? userProfile.following.length : 0;
  const likeCount = userProfile?.likes || 1;

  // Distinguish incoming notifications vs outgoing pending requests
  const incomingNotifs = notifications.filter((n) => n.targetUserId === userProfile?.id);

  const filteredNotifs = notifications.filter((n) => {
    if (activeTab === 'requests') return n.type === 'friend_request';
    if (activeTab === 'social') return n.type === 'wave' || n.type === 'like' || n.type === 'follow' || n.type === 'friend_accept';
    return true;
  });

  const unreadCount = incomingNotifs.filter((n) => !n.read).length;

  // Auto-mark notifications as read when opening center so unread badge clears
  useEffect(() => {
    if (isOpen && userProfile?.id && unreadCount > 0) {
      wsService.markNotificationsRead(userProfile.id);
      onUpdateNotifications?.((prev) =>
        prev.map((n) => (n.targetUserId === userProfile.id ? { ...n, read: true } : n))
      );
    }
  }, [isOpen, userProfile?.id]);

  if (!isOpen) return null;

  async function handleAcceptFriend(notif) {
    soundEngine.playGiftFanfare();
    const updated = await wsService.respondToFriendRequest(notif.id, 'accepted', userProfile?.id);
    if (updated) {
      onUpdateNotifications?.((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, status: 'accepted', read: true } : n))
      );
      if (userProfile && notif.fromUser?.id) {
        const nextFriends = Array.from(new Set([...(userProfile.friends || []), notif.fromUser.id]));
        const updatedProfile = { ...userProfile, friends: nextFriends };
        onUpdateUserProfile?.(updatedProfile);
      }
    }
  }

  async function handleDeclineFriend(notif) {
    soundEngine.playHeartbeat();
    const updated = await wsService.respondToFriendRequest(notif.id, 'declined', userProfile?.id);
    if (updated) {
      onUpdateNotifications?.((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, status: 'declined', read: true } : n))
      );
    }
  }

  async function handleMarkAllRead() {
    soundEngine.playRomanticChime();
    if (userProfile?.id) {
      await wsService.markNotificationsRead(userProfile.id);
    }
    onUpdateNotifications?.((prev) =>
      prev.map((n) => (n.targetUserId === userProfile?.id ? { ...n, read: true } : n))
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 font-mono select-text animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-black border border-zinc-800   shadow-2xl shadow-red-950/30 flex flex-col max-h-[88vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5   bg-red-950/60 border border-red-600/50 text-red-400 text-sm">
              🔔
            </span>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base font-heading">
                {isAm ? "ማሳወቂያዎች" : "Notifications"}
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono">DevSoulmate Event Bus</p>
            </div>
            {unreadCount > 0 && (
              <span className="ml-1 px-2 py-0.5   bg-red-600 text-white text-[10px] font-black animate-pulse">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] text-red-400 hover:text-red-300 font-bold hover:underline"
              >
                {isAm ? "ሁሉንም አንብብ" : "Mark all read"}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1   bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="p-3 bg-zinc-950/70 border-b border-zinc-800 flex items-center justify-around text-xs shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white">{friendCount}</span>
            <span className="text-zinc-500 text-[11px]">{isAm ? "ጓደኞች" : "Friends"}</span>
          </div>
          <div className="w-px h-4 bg-zinc-800" />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white">{followerCount}</span>
            <span className="text-zinc-500 text-[11px]">Followers</span>
          </div>
          <div className="w-px h-4 bg-zinc-800" />
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">✓</span>
            <span className="font-bold text-white">{followingCount}</span>
            <span className="text-zinc-500 text-[11px]">Following</span>
          </div>
          <div className="w-px h-4 bg-zinc-800" />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white">{likeCount}</span>
            <span className="text-zinc-500 text-[11px]">{isAm ? "ተወዳጅነት" : "Likes"}</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-2 bg-black border-b border-zinc-800 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5   font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white bg-zinc-900/50'
            }`}
          >
            {isAm ? "ሁሉም" : "All"} ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5   font-bold transition-all ${
              activeTab === 'requests'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white bg-zinc-900/50'
            }`}
          >
            {isAm ? "የጓደኝነት ጥያቄዎች" : "Requests"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`px-3 py-1.5   font-bold transition-all ${
              activeTab === 'social'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white bg-zinc-900/50'
            }`}
          >
            {isAm ? "ግንኙነቶች" : "Social Vibes"}
          </button>
        </div>

        {/* Notifications Feed */}
        <div
          className="flex-1 overflow-y-auto p-3 space-y-2.5"
          style={{ scrollbarWidth: 'thin' }}
        >
          {filteredNotifs.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 space-y-2">
              <span className="text-3xl block">📭</span>
              <p className="text-xs text-zinc-300 font-bold">{isAm ? "ምንም አዲስ ማሳወቂያ የለም" : "No notifications right now."}</p>
              <p className="text-[10px] text-zinc-500">
                {isAm ? "ገንቢዎችን ያግኙ እና ጓደኝነት ይጀምሩ!" : "Connect with developers in Registered Peers to receive updates!"}
              </p>
            </div>
          ) : (
            filteredNotifs.map((notif) => {
              const isReq = notif.type === 'friend_request';
              const isAccepted = notif.status === 'accepted';
              const isDeclined = notif.status === 'declined';

              return (
                <div
                  key={notif.id}
                  className={`p-3   border transition-all text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    notif.read
                      ? 'bg-zinc-950/80 border-zinc-800'
                      : 'bg-zinc-900/90 border-red-900/70 shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div className="w-10 h-10   bg-black border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                      {notif.fromUser?.avatarUrl ? (
                        <img
                          src={notif.fromUser.avatarUrl}
                          alt={notif.fromUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl">{notif.fromUser?.emoji || '🧑‍💻'}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-white truncate">{notif.fromUser?.name || 'Developer'}</span>
                        <span className="text-[10px] text-red-400">{notif.fromUser?.handle}</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-0.5">{notif.text}</p>
                      <span className="text-[9px] text-zinc-500 block mt-1">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Actions for Friend Request */}
                  {isReq && (
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {isAccepted ? (
                        <span className="px-2.5 py-1   bg-zinc-900 border border-zinc-700 text-white text-[10px] font-bold">
                          ✓ {isAm ? "ጓደኛ ሆነዋል" : "Friends"}
                        </span>
                      ) : isDeclined ? (
                        <span className="px-2.5 py-1   bg-zinc-950 border border-zinc-800 text-zinc-500 text-[10px]">
                          Declined
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleAcceptFriend(notif)}
                            className="px-3 py-1.5   bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all shadow"
                          >
                            {isAm ? "ተቀበል ✓" : "Accept"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeclineFriend(notif)}
                            className="px-2.5 py-1.5   bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs transition-all"
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Action for Chat Message or Social Action */}
                  {!isReq && notif.fromUser?.id && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenChatWithPeer?.(notif.fromUser);
                      }}
                      className="px-3 py-1.5   bg-zinc-900 hover:bg-zinc-800 border border-red-600/70 text-red-300 font-bold text-[11px] transition-all shrink-0 self-end sm:self-center"
                    >
                      {isAm ? "አውራ" : "Chat"}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
