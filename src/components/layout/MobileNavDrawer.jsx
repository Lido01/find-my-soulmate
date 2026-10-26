// ─────────────────────────────────────────────────────────────────────────────
// MobileNavDrawer.jsx — Sleek mobile navigation drawer for small screens
// High-tech Red, Black & White developer theme with Space Grotesk / JetBrains Mono
// ─────────────────────────────────────────────────────────────────────────────

import { IconX } from '../ui/Icons.jsx';
import LanguageToggle from '../ui/LanguageToggle.jsx';
import { soundEngine } from '../../utils/audio.js';

export default function MobileNavDrawer({
  isOpen,
  onClose,
  chatMode = 'virtual',
  onToggleChatMode,
  unreadCount = 0,
  unreadNotifCount = 0,
  onOpenNotifications,
  userProfile,
  onOpenProfile,
  onOpenRegister,
  onOpenAbout,
  onOpenApiKey,
  apiKeySet = false,
  theme = 'dark',
  onToggleTheme,
  onLogout,
  lang = 'en',
}) {
  if (!isOpen) return null;

  const isAm = lang === 'am';

  return (
    <div
      className="fixed inset-0 z-50 md:hidden bg-black/85 backdrop-blur-md flex justify-end animate-fade-in font-mono select-text"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="w-80 h-full bg-black border-l border-zinc-800 shadow-2xl flex flex-col overflow-y-auto animate-slide-left p-4 space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5   bg-red-500 animate-pulse" />
            <span className="font-heading text-sm font-black text-white tracking-wider">DevSoulmate.io</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5   bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-red-600 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3.5   bg-zinc-950 border border-zinc-800 space-y-2.5 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-1.5   bg-black border border-zinc-800">
              {userProfile?.emoji || '🧑‍💻'}
            </span>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-white text-xs truncate">
                {userProfile?.name || 'Anonymous Dev'}
              </h4>
              <p className="text-[11px] text-zinc-500 truncate">{userProfile?.handle || '@me'}</p>
              <span className="text-[10px] text-red-400 font-bold block mt-0.5">
                {userProfile?.lookingFor === 'male' ? 'Looking for Boyfriend' : 'Looking for Girlfriend'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRegister?.();
            }}
            className="w-full py-2   bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>{isAm ? "ካርዴን አስተካክል / መዝግብ" : "Register / Edit Dev Card"}</span>
          </button>
        </div>

        {/* Mode Selector */}
        <div className="space-y-1.5 shrink-0">
          <label className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold font-mono">
            {isAm ? "የውይይት አይነት ምረጥ" : "Select Chat Mode"}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                if (!userProfile?.isRegistered) {
                  soundEngine.playHeartbeat();
                  onClose();
                  onOpenRegister?.();
                  return;
                }
                soundEngine.playHeartbeat();
                onToggleChatMode?.('virtual');
                onClose();
              }}
              className={`p-2.5   border text-xs font-bold transition-all flex flex-col items-center gap-1 text-center ${
                chatMode === 'virtual'
                  ? 'bg-red-600 border-red-500 text-white shadow-md'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span>AI Soulmates</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!userProfile?.isRegistered) {
                  soundEngine.playHeartbeat();
                  onClose();
                  onOpenRegister?.();
                  return;
                }
                soundEngine.playRomanticChime();
                onToggleChatMode?.('real_ws');
                onClose();
              }}
              className={`p-2.5   border text-xs font-bold transition-all flex flex-col items-center gap-1 text-center ${
                chatMode === 'real_ws'
                  ? 'bg-red-600 border-red-500 text-white shadow-md'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span>Live Match</span>
                {unreadCount > 0 && (
                  <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.2   font-black animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Theme Toggle in Mobile Drawer */}
        <div className="p-3   bg-zinc-950 border border-zinc-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-zinc-300 font-bold flex items-center gap-1.5">
            <span>{theme === 'light' ? 'Light Theme' : 'Dark Theme'}</span>
          </span>
          <button
            type="button"
            onClick={onToggleTheme}
            className="px-3 py-1   bg-zinc-900 border border-zinc-700 text-white text-xs font-bold hover:border-red-600 transition-colors"
          >
            Switch to {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>

        {/* Menu Buttons List */}
        <div className="space-y-2 pt-1 text-xs flex-1">
          {/* Notifications Center */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenNotifications?.();
            }}
            className="w-full p-2.5   bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-red-600 text-left text-zinc-300 hover:text-white flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <span>🔔</span>
              <span>{isAm ? "ማሳወቂያዎች" : "Notifications"}</span>
            </span>
            {unreadNotifCount > 0 ? (
              <span className="px-1.5 py-0.2   bg-red-600 text-white text-[10px] font-black animate-pulse">
                {unreadNotifCount}
              </span>
            ) : (
              <span className="text-zinc-600">→</span>
            )}
          </button>

          {/* About & Guide */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAbout?.();
            }}
            className="w-full p-2.5   bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-red-600 text-left text-zinc-300 hover:text-white flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <span>📖</span>
              <span>{isAm ? "ስለ መተግበሪያው እና መመሪያ" : "About & Dating Guide"}</span>
            </span>
            <span className="text-zinc-600">→</span>
          </button>

          {/* Gemini AI Key */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenApiKey?.();
            }}
            className="w-full p-2.5   bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-red-600 text-left text-zinc-300 hover:text-white flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <span>{isAm ? "የ Gemini AI ቁልፍ ማገናኛ" : "Google Gemini AI Settings"}</span>
            </span>
            <span className={apiKeySet ? "text-red-400 font-bold" : "text-zinc-500"}>
              {apiKeySet ? "Active" : "Connect"}
            </span>
          </button>

          {/* Profile & Voice Settings */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenProfile?.();
            }}
            className="w-full p-2.5   bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-red-600 text-left text-zinc-300 hover:text-white flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <span>⚙️</span>
              <span>{isAm ? "የድምፅ እና የመገለጫ ቅንብሮች" : "Sound & Profile Settings"}</span>
            </span>
            <span className="text-zinc-600">→</span>
          </button>
        </div>

        {/* Language Switcher in Drawer */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between shrink-0">
          <span className="text-zinc-500 text-xs font-mono">Language</span>
          <LanguageToggle />
        </div>

        {/* Logout Button */}
        <div className="pt-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to logout? Your profile and Love Code are saved in the database!")) {
                onLogout?.();
                onClose();
              }
            }}
            className="w-full py-2.5   border border-red-900/60 bg-red-950/40 text-red-300 hover:bg-red-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <span>{isAm ? "ከመለያ ውጣ (Logout)" : "Logout"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
