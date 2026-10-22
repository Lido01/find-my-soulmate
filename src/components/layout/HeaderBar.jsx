// ─────────────────────────────────────────────────────────────────────────────
// HeaderBar.jsx — Navigation, Profile Settings, AI Mode, and Voice Controls
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { MOOD_META } from "../../data/characters.js";
import LanguageToggle from "../ui/LanguageToggle.jsx";
import { IconSettings, IconRefresh, IconChevronRight, IconUser, IconHeart } from "../ui/Icons.jsx";
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
  onBack,
  onApiKeyClick,
  onOpenProfile,
  onOpenRegister,
  onOpenAbout,
  onOpenMobileMenu,
  apiKeySet = false,
  chatMode = 'virtual',
  onToggleChatMode,
  unreadCount = 0,
  theme = 'dark',
  onToggleTheme,
  t,
}) {
  const [resetConfirm, setResetConfirm] = useState(false);
  const clock = useClock();

  const isChat = phase === "chat";
  const mood = charState?.mood;
  const moodMeta = MOOD_META[mood] ?? {};

  function handleResetClick() {
    if (resetConfirm) {
      soundEngine.playHeartbeat();
      onReset?.();
      setResetConfirm(false);
    } else {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
    }
  }

  return (
    <header className="h-12 flex items-center gap-2 px-3 bg-slate-950 border-b border-slate-800 shrink-0 z-30">
      {/* macOS window dots */}
      <div className="flex items-center gap-1.5 mr-1">
        <span className="w-3 h-3  bg-red-500/70" />
        <span className="w-3 h-3  bg-amber-500/70" />
        <span className="w-3 h-3  bg-emerald-500/70" />
      </div>

      {/* Back button (chat phase only) */}
      {isChat && onBack && (
        <button
          onClick={() => {
            soundEngine.playHeartbeat();
            onBack();
          }}
          className="font-mono text-xs text-slate-400 hover:text-white transition-colors px-2 py-1  hover:bg-slate-800 flex items-center gap-1"
        >
          <span>{t?.back ?? "back"}</span>
        </button>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 font-mono text-xs min-w-0">
        <span className="text-cyan-400 font-bold truncate max-w-[100px] sm:max-w-none">find_soulmate</span>
      </div>

      {/* Mode Switcher: Virtual AI vs Real WebSocket (Visible on ALL devices) */}
      <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 ml-1 sm:ml-2 shrink-0">
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
              ? 'bg-slate-800 border border-cyan-600 text-cyan-300 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
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
              ? 'bg-cyan-950 border border-cyan-500 text-cyan-200 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Match & Chat with Real Online Developers via WebSockets"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">Live Match</span>
          <span className="sm:hidden font-bold">Live</span>
          {unreadCount > 0 && (
            <span
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] sm:text-[10px] font-black animate-pulse shadow-md ml-0.5"
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
        {/* Theme Toggle (Light / Dark) */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playRomanticChime();
            onToggleTheme?.();
          }}
          className="flex items-center gap-1 font-mono text-[11px] px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white transition-colors shadow-sm"
          title="Toggle Light / Dark Mode"
        >
          <span>{theme === 'light' ? '🌙' : '☀️'}</span>
          <span className="hidden md:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>
        {/* Mobile Hamburger Menu Button (Visible on screens < md) */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playHeartbeat();
            onOpenMobileMenu?.();
          }}
          className="md:hidden flex items-center gap-1.5 font-mono text-xs px-2.5 py-1.5  border border-slate-700 bg-slate-900 text-cyan-300 hover:bg-slate-800 transition-all shadow-sm"
          title="Open Mobile Navigation Menu"
        >
          <span className="text-sm">☰</span>
          <span className="font-bold">Menu</span>
        </button>

        {/* About & Guide Button (Desktop) */}
        <button
          onClick={() => {
            soundEngine.playHeartbeat();
            onOpenAbout?.();
          }}
          className="hidden md:flex items-center gap-1.5 font-mono text-xs px-2.5 py-1  border border-slate-800 bg-slate-900 hover:border-amber-500/80 text-amber-300 hover:text-white transition-all shadow-sm"
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
          className="hidden sm:flex items-center gap-1.5 font-mono text-xs px-2.5 py-1  border border-slate-800 bg-slate-900 hover:border-cyan-500/80 text-slate-300 hover:text-white transition-all shadow-sm"
          title="Profile & Audio Voice Settings"
        >
          <span>{userProfile?.emoji || '🧑‍💻'}</span>
          <span className="font-bold">{userProfile?.name || 'Profile'}</span>
        </button>

        {/* Dev Register CTA (Desktop) */}
        <button
          onClick={() => {
            soundEngine.playRomanticChime();
            onOpenRegister?.();
          }}
          className="hidden lg:flex items-center gap-1.5 font-mono text-xs px-2.5 py-1  border border-cyan-800 bg-cyan-950/60 hover:border-cyan-500 text-cyan-300 hover:text-white transition-all shadow-sm"
          title="Register Developer Dating Card"
        >
          <span className="font-bold">Dev Card</span>
        </button>

        {/* Language toggle (Desktop) */}
        <div className="hidden sm:block">
          <LanguageToggle />
        </div>

        {/* AI Mode button (Desktop) */}
        <button
          onClick={onApiKeyClick}
          className={`hidden sm:flex items-center gap-1.5 font-mono text-xs px-2.5 py-1  border transition-all duration-200
            ${apiKeySet
              ? "border-emerald-600 text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60"
              : "border-slate-700 text-slate-400 bg-slate-900 hover:bg-slate-800 hover:text-slate-200"
            }
          `}
          title={apiKeySet ? "AI Mode Active (Gemini Connected)" : "Connect Gemini API Key for Freeform Chat"}
        >
          <span className="font-bold">{apiKeySet ? "AI ON" : "AI Mode"}</span>
        </button>

        {/* Clock */}
        <span className="hidden lg:inline font-mono text-xs text-slate-500 px-1">{clock}</span>

        {/* Reset button (Desktop) */}
        <button
          onClick={handleResetClick}
          className={`hidden md:flex items-center gap-1 font-mono text-xs px-2.5 py-1  border transition-all duration-200
            ${resetConfirm
              ? "bg-red-950/80 border-red-600 text-red-300 animate-pulse font-bold"
              : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300"
            }
          `}
          title="Hard reset simulation data in localStorage"
        >
          <IconRefresh className="w-3 h-3" />
          <span>{resetConfirm ? (t?.wipeCacheConfirm ?? "CONFIRM?") : (t?.wipeCacheBtn ?? "Reset")}</span>
        </button>
      </div>
    </header>
  );
}
