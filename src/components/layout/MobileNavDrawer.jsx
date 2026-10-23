// ─────────────────────────────────────────────────────────────────────────────
// MobileNavDrawer.jsx — Sleek mobile navigation drawer for small screens
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
  onReset,
  lang = 'en',
}) {
  if (!isOpen) return null;

  const isAm = lang === 'am';

  return (
    <div
      className="fixed inset-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-md flex justify-end animate-fade-in font-mono"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="w-80 h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col overflow-y-auto animate-slide-left p-4 space-y-5">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5  bg-fuchsia-400 animate-pulse" />
            <span className="text-sm font-bold text-white tracking-wider">find_my_soulmate</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5  bg-slate-800 text-slate-400 hover:text-white"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3.5  bg-slate-950 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-1.5  bg-slate-900 border border-slate-800">
              {userProfile?.emoji || '🧑‍💻'}
            </span>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-white text-xs truncate">
                {userProfile?.name || 'Anonymous Dev'}
              </h4>
              <p className="text-[11px] text-slate-500 truncate">{userProfile?.handle || '@me'}</p>
              <span className="text-[10px] text-cyan-400 font-bold block mt-0.5">
                {userProfile?.lookingFor === 'male' ? 'Looking for Boyfriend 👨‍💻' : 'Looking for Girlfriend 👩‍💻'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRegister?.();
            }}
            className="w-full py-2  bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
          >
            <span>📝</span>
            <span>{isAm ? "ካርዴን አስተካክል / መዝግብ" : "Register / Edit Dev Card"}</span>
          </button>
        </div>

        {/* Mode Selector */}
        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">
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
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 text-center ${
                chatMode === 'virtual'
                  ? 'bg-cyan-950 border-cyan-600 text-cyan-300 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
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
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 text-center ${
                chatMode === 'real_ws'
                  ? 'bg-cyan-950 border-cyan-600 text-cyan-300 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span>Live Match</span>
                {unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Theme Toggle in Mobile Drawer */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
            <span>{theme === 'light' ? '☀️' : '🌙'}</span>
            <span>{theme === 'light' ? 'Light Theme' : 'Dark Theme'}</span>
          </span>
          <button
            type="button"
            onClick={onToggleTheme}
            className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-bold"
          >
            Switch to {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>

        {/* Menu Buttons List */}
        <div className="space-y-2 pt-1 text-xs">
          {/* Notifications Center */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenNotifications?.();
            }}
            className="w-full p-2.5  bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-slate-300 hover:text-white flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <span>🔔</span>
              <span>{isAm ? "ማሳወቂያዎች" : "Notifications"}</span>
            </span>
            {unreadNotifCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                {unreadNotifCount}
              </span>
            ) : (
              <span>→</span>
            )}
          </button>

          {/* About & Guide */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAbout?.();
            }}
            className="w-full p-2.5  bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-slate-300 hover:text-white flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <span>📖</span>
              <span>{isAm ? "ስለ መተግበሪያው እና መመሪያ" : "About & Dating Guide"}</span>
            </span>
            <span>→</span>
          </button>

          {/* Gemini AI Key */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenApiKey?.();
            }}
            className="w-full p-2.5  bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-slate-300 hover:text-white flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <span>🤖</span>
              <span>{isAm ? "የ Gemini AI ቁልፍ ማገናኛ" : "Google Gemini AI Settings"}</span>
            </span>
            <span className={apiKeySet ? "text-emerald-400 font-bold" : "text-slate-500"}>
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
            className="w-full p-2.5  bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left text-slate-300 hover:text-white flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <span>⚙️</span>
              <span>{isAm ? "የድምፅ እና የመገለጫ ቅንብሮች" : "Sound & Profile Settings"}</span>
            </span>
            <span>→</span>
          </button>
        </div>

        {/* Language Switcher in Drawer */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-slate-500 text-xs">Language</span>
          <LanguageToggle />
        </div>

        {/* Logout Button */}
        <div className="pt-auto mt-auto">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Are you sure you want to logout? Your profile and Love Code are saved in the database!")) {
                onLogout?.();
                onClose();
              }
            }}
            className="w-full py-2.5 rounded-xl border border-red-900/60 bg-red-950/40 text-red-300 hover:bg-red-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <span>🚪</span>
            <span>{isAm ? "ከመለያ ውጣ (Logout)" : "Logout"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
