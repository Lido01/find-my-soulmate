// ─────────────────────────────────────────────────────────────────────────────
// HeaderBar.jsx — Navigation, Profile Settings, AI Mode, and Voice Controls
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { MOOD_META } from "../../data/characters.js";
import LanguageToggle from "../ui/LanguageToggle.jsx";
import { IconSettings, IconRefresh, IconChevronRight, IconUser, IconHeart, IconBell, IconSun, IconMoon, IconMenu } from "../ui/Icons.jsx";
import { soundEngine } from "../../utils/audio.js";

function useClock() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 10000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function HeaderBar({
  phase,
  activeCharacter,
  charState,
  userProfile,
  onReset,
  onLogout,
  onBack,
  onApiKeyClick,
  onOpenProfile,
  onOpenRegister,
  onOpenAbout,
  onOpenNotifications,
  unreadNotifCount = 0,
  onOpenMobileMenu,
  apiKeySet = false,
  chatMode = 'virtual',
  onToggleChatMode,
  unreadCount = 0,
  theme = 'dark',
  onToggleTheme,
  t,
}) {
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const clock = useClock();

  const isChat = phase === "chat";
  const mood = charState?.mood;
  const moodMeta = MOOD_META[mood] ?? {};

  function handleLogoutClick() {
    if (logoutConfirm) {
      soundEngine.playHeartbeat();
      onLogout?.();
      setLogoutConfirm(false);
    } else {
      setLogoutConfirm(true);
      setTimeout(() => setLogoutConfirm(false), 3500);
    }
  }

  return (
    <header className="h-12 flex items-center gap-2 px-3 bg-black border-b border-zinc-800/90 shrink-0 z-30 font-sans">
      {/* macOS window dots */}
      <div className="flex items-center gap-1.5 mr-1">
        <span className="w-2.5 h-2.5 rounded-full bg-red-600/90 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
        <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
        <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
      </div>

      {/* Back button (chat phase only) */}
      {isChat && onBack && (
        <button
          onClick={() => {
            soundEngine.playHeartbeat();
            onBack();
          }}
          className="font-mono text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-zinc-900 flex items-center gap-1"
        >
          <span>{t?.back ?? "back"}</span>
        </button>
      )}

      {/* Breadcrumb Brand */}
      <div className="flex items-center gap-1.5 font-sans font-bold text-xs sm:text-sm tracking-tight min-w-0">
        <span className="text-red-500 flex items-center gap-1">
          <span className="text-base">❤️</span>
          <span className="hidden xs:inline">DevSoulmate</span>
        </span>
        <span className="text-zinc-600 hidden sm:inline">/</span>
        <span className="text-zinc-300 font-mono text-[11px] hidden sm:inline">tech_social</span>
      </div>

      {/* Mode Switcher: Virtual AI vs Real WebSocket (Visible on ALL devices) */}
      <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-0.5 ml-1 sm:ml-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            if (!userProfile?.isRegistered) {
              soundEngine.playHeartbeat();
              onOpenRegister?.();
              return;
            }
            soundEngine.playHeartbeat();
            onToggleChatMode?.('virtual');
          }}
          className={`font-mono text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
            chatMode === 'virtual'
              ? 'bg-zinc-900 border border-zinc-700 text-white font-bold shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Chat with Virtual / AI Developer Soulmates"
        >
          <span className="hidden sm:inline">AI Soulmates</span>
          <span className="sm:hidden font-bold">AI</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!userProfile?.isRegistered) {
              soundEngine.playHeartbeat();
              onOpenRegister?.();
              return;
            }
            soundEngine.playRomanticChime();
            onToggleChatMode?.('real_ws');
          }}
          className={`font-mono text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
            chatMode === 'real_ws'
              ? 'bg-red-950/80 border border-red-600 text-white font-bold shadow-[0_0_12px_rgba(239,68,68,0.3)]'
              : 'text-zinc-400 hover:text-white'
          }`}
          title="Match & Chat with Real Online Developers via WebSockets"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="hidden sm:inline">Live Match</span>
          <span className="sm:hidden font-bold">Live</span>
          {unreadCount > 0 && (
            <span
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[9px] sm:text-[10px] font-black animate-pulse shadow-md ml-0.5"
              title={`${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`}
            >
              <span className="hidden sm:inline">💬</span>
              <span>{unreadCount}</span>
            </span>
          )}
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right cluster */}
      <div className="flex items-center gap-2">
        {/* Notification Bell (All devices) */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playHeartbeat();
            onOpenNotifications?.();
          }}
          className="relative flex items-center justify-center p-1.5 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white hover:border-red-500 transition-all shadow-sm"
          title="Notifications & Friend Requests"
        >
          <IconBell className="w-4 h-4" />
          {unreadNotifCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[9px] font-black animate-pulse shadow-[0_0_6px_rgba(239,68,68,0.7)]">
              {unreadNotifCount}
            </span>
          )}
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playRomanticChime();
            onToggleTheme?.();
          }}
          className="flex items-center gap-1 font-mono text-[11px] px-2.5 py-1 rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-white transition-colors shadow-sm"
          title="Toggle Light / Dark Mode"
        >
          {theme === 'light' ? <IconMoon className="w-3.5 h-3.5" /> : <IconSun className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>

        {/* Mobile Hamburger Menu Button (Visible on screens < md) */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playHeartbeat();
            onOpenMobileMenu?.();
          }}
          className="md:hidden flex items-center gap-1.5 font-mono text-xs px-2.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white hover:border-red-500 transition-all shadow-sm"
          title="Open Mobile Navigation Menu"
        >
          <IconMenu className="w-4 h-4" />
          <span className="font-bold">Menu</span>
        </button>

        {/* About & Guide Button (Desktop) */}
        <button
          onClick={() => {
            soundEngine.playHeartbeat();
            onOpenAbout?.();
          }}
          className="hidden md:flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-red-500/80 text-zinc-300 hover:text-white transition-all shadow-sm"
          title="About & Dating Guide"
        >
          <span className="font-bold">Guide</span>
        </button>

        {/* Profile & Audio Settings Button (Desktop) */}
        <button
          onClick={() => {
            soundEngine.playHeartbeat();
            onOpenProfile?.();
          }}
          className="hidden sm:flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-red-500/80 text-white transition-all shadow-sm"
          title="Profile & Audio Voice Settings"
        >
          <IconUser className="w-3.5 h-3.5 text-red-400" />
          <span className="font-bold">{userProfile?.name || 'Profile'}</span>
        </button>

        {/* Language toggle (Desktop) */}
        <div className="hidden sm:block">
          <LanguageToggle />
        </div>

        {/* AI Mode button (Desktop) */}
        <button
          onClick={onApiKeyClick}
          className={`hidden sm:flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-xl border transition-all duration-200
            ${apiKeySet
              ? "border-emerald-600 text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60"
              : "border-zinc-800 text-zinc-400 bg-zinc-950 hover:border-zinc-700 hover:text-white"
            }
          `}
          title={apiKeySet ? "AI Mode Active (Gemini Connected)" : "Connect Gemini API Key for Freeform Chat"}
        >
          <span className="font-bold">{apiKeySet ? "AI ON" : "AI Mode"}</span>
        </button>

        {/* Clock */}
        <span className="hidden lg:inline font-mono text-xs text-zinc-500 px-1">{clock}</span>

        {/* Logout Button (Desktop) */}
        <button
          onClick={handleLogoutClick}
          className={`hidden md:flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-xl border transition-all duration-200
            ${logoutConfirm
              ? "bg-red-950 border-red-500 text-white animate-pulse font-bold shadow-[0_0_10px_rgba(239,68,68,0.5)]"
              : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-red-600 hover:text-red-400"
            }
          `}
          title="Logout from platform"
        >
          <span>{logoutConfirm ? "Confirm Logout?" : "Logout"}</span>
        </button>
      </div>
    </header>
  );
}
