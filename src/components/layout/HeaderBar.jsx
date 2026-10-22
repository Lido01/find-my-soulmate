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
          <span>←</span>
          <span>{t?.back ?? "back"}</span>
        </button>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 font-mono text-xs">
        <span className="text-fuchsia-400 font-bold">find_my_soulmate</span>
        {isChat && activeCharacter && (
          <>
            <IconChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-slate-400">@{activeCharacter.handle}</span>
          </>
        )}
      </div>

      {/* Chat phase: partner mood pill & gender */}
      {isChat && activeCharacter && moodMeta.emoji && (
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 border border-slate-700  px-2.5 py-0.5 ml-1">
          <span className="text-xs">{moodMeta.emoji}</span>
          <span className="font-mono text-[10px] text-slate-300 font-bold">{activeCharacter.name}</span>
          <span className="text-[10px] text-slate-500">
            {activeCharacter.gender === 'female' ? '👩‍💻 GF' : '👨‍💻 BF'}
          </span>
        </div>
      )}

      {/* Mode Switcher: Virtual AI vs Real WebSocket (Desktop/Tablet) */}
      <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800  p-0.5 ml-2">
        <button
          type="button"
          onClick={() => {
            soundEngine.playHeartbeat();
            onToggleChatMode?.('virtual');
          }}
          className={`font-mono text-[11px] px-2.5 py-1  transition-all flex items-center gap-1.5 ${
            chatMode === 'virtual'
              ? 'bg-fuchsia-950 border border-fuchsia-700 text-fuchsia-300 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Chat with Virtual / AI Developer Soulmates"
        >
          <span className="hidden md:inline">Computer</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.playRomanticChime();
            onToggleChatMode?.('real_ws');
          }}
          className={`font-mono text-[11px] px-2.5 py-1  transition-all flex items-center gap-1.5 ${
            chatMode === 'real_ws'
              ? 'bg-cyan-950 border border-cyan-600 text-cyan-300 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Match & Chat with Real Online Developers via WebSockets"
        >
          <span className="hidden md:inline">Live Match</span>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right cluster */}
      <div className="flex items-center gap-2">
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
