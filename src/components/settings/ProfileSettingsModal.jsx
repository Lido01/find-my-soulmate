// ─────────────────────────────────────────────────────────────────────────────
// ProfileSettingsModal.jsx — Complete Profile, Audio & Voice Settings
// High-tech Red, Black & White developer theme with Space Grotesk / JetBrains Mono
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { IconX, IconCheck, IconUser } from '../ui/Icons.jsx';
import { soundEngine } from '../../utils/audio.js';

export default function ProfileSettingsModal({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  audioSettings,
  onSaveAudioSettings,
  onOpenOnboarding,
  theme = 'dark',
  onToggleTheme,
  lang = 'en',
}) {
  const [profile, setProfile] = useState({ ...userProfile });
  const [audio, setAudio] = useState({ ...audioSettings });
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  function handleSave() {
    soundEngine.enabled = audio.soundEffects;
    soundEngine.voiceEnabled = audio.voiceNarration;
    soundEngine.voiceVolume = audio.volume;

    onSaveProfile?.(profile);
    onSaveAudioSettings?.(audio);

    soundEngine.playRomanticChime();
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose?.();
    }, 900);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in font-mono select-text"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="relative w-full max-w-lg bg-black border border-zinc-800   shadow-2xl shadow-red-950/40 overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5   bg-red-950/70 border border-red-600/50 text-red-400">
              <IconUser className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-heading text-base font-bold text-white">
                {lang === 'am' ? 'የመገለጫ እና የድምፅ ቅንብሮች' : 'Profile & Audio Settings'}
              </h2>
              <p className="text-[10px] text-zinc-500 font-mono">Preferences, Audio & Match Filters</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5   bg-zinc-900 border border-zinc-800 hover:border-red-600 transition-colors"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-black" style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a transparent' }}>
          {/* Section 1: User Profile */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold text-red-400 uppercase tracking-widest">
              // {lang === 'am' ? 'የእርስዎ መገለጫ' : 'Dev Profile'}
            </h3>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={profile.emoji}
                onChange={(e) => setProfile((p) => ({ ...p, emoji: e.target.value }))}
                className="w-12 h-12 bg-zinc-950 border border-zinc-800   text-center text-2xl focus:border-red-500 focus:outline-none"
                title="Profile Emoji"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={profile.name || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Your Name"
                  className="w-full bg-zinc-950 border border-zinc-800   px-3.5 py-2.5 font-mono text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[11px] text-zinc-400 block mb-1">
                  {lang === 'am' ? 'አርኬታይፕ' : 'Archetype'}
                </label>
                <input
                  type="text"
                  value={profile.archetype || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, archetype: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800   px-3 py-2 font-mono text-xs text-zinc-300 focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono text-[11px] text-zinc-400 block mb-1">
                  {lang === 'am' ? 'ቴክ ስብስብ' : 'Tech Stack'}
                </label>
                <input
                  type="text"
                  value={profile.favoriteStack || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, favoriteStack: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800   px-3 py-2 font-mono text-xs text-zinc-300 focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Looking For Gender Filter */}
            <div>
              <label className="font-mono text-[11px] text-zinc-400 block mb-1.5 font-bold">
                {lang === 'am' ? 'የፍለጋ ምርጫ' : 'Looking to Find'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'female', label: 'Girlfriend' },
                  { id: 'male', label: 'Boyfriend' },
                  { id: 'all', label: 'Everyone' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setProfile((p) => ({ ...p, lookingFor: opt.id }))}
                    className={`py-2 px-1 text-center   font-mono text-xs border transition-all ${
                      profile.lookingFor === opt.id
                        ? 'border-red-500 bg-red-950/60 text-white font-bold'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-800" />

          <div className="h-px bg-zinc-800" />

          {/* Section 2: Audio & Romantic Voice */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold text-red-400 uppercase tracking-widest">
              // {lang === 'am' ? 'የድምፅ እና የሮማንቲክ ኦዲዮ ቅንብር' : 'Audio & Voice Synthesis'}
            </h3>

            {/* Appearance / Theme Toggle */}
            <div className="flex items-center justify-between p-3   bg-zinc-950 border border-zinc-800">
              <div>
                <p className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{lang === 'am' ? 'የገጽታ ቀለም (Theme)' : 'Theme Appearance'}</span>
                </p>
                <p className="font-mono text-[11px] text-zinc-500">
                  {theme === 'light' ? 'Active: Crisp White Light Mode' : 'Active: Cyber Red & Pitch Black Dark Mode'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playRomanticChime();
                  onToggleTheme?.();
                }}
                className={`px-3 py-1.5   border font-bold text-xs transition-all flex items-center gap-1.5 ${
                  theme === 'light'
                    ? 'bg-red-600 text-white border-red-500 shadow-sm'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
                }`}
              >
                <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>

            {/* Voice narration toggle */}
            <div className="flex items-center justify-between p-3   bg-zinc-950 border border-zinc-800">
              <div>
                <p className="font-mono text-xs font-bold text-white">
                  {lang === 'am' ? 'የገፀ-ባህሪያት ድምፅ ንግግር' : 'Romantic Voice Narration (TTS)'}
                </p>
                <p className="font-mono text-[11px] text-zinc-500">
                  {lang === 'am' ? 'ገፀ-ባህሪያት መልእክታቸውን በድምፅ ያሰማሉ' : 'Partners speak their messages with realistic audio'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAudio((a) => ({ ...a, voiceNarration: !a.voiceNarration }))}
                className={`w-12 h-6   transition-colors relative p-0.5 ${
                  audio.voiceNarration ? 'bg-red-600' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-5 h-5   bg-white transition-transform ${
                    audio.voiceNarration ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Romantic sound effects toggle */}
            <div className="flex items-center justify-between p-3   bg-zinc-950 border border-zinc-800">
              <div>
                <p className="font-mono text-xs font-bold text-white">
                  {lang === 'am' ? 'የፍቅር ድምፆች (Chimes & Pulse)' : 'Romantic Audio Chimes & Beeps'}
                </p>
                <p className="font-mono text-[11px] text-zinc-500">
                  {lang === 'am' ? 'ለስላሳ የልብ ምት እና የደስታ ዜማዎች' : 'Web Audio chords on messages and gifts'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAudio((a) => ({ ...a, soundEffects: !a.soundEffects }))}
                className={`w-12 h-6   transition-colors relative p-0.5 ${
                  audio.soundEffects ? 'bg-red-600' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-5 h-5   bg-white transition-transform ${
                    audio.soundEffects ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Test Voice Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playRomanticChime();
                soundEngine.speakRomanticVoice(
                  "Hello my favorite developer. My heart compiles with 100% test coverage for you.",
                  profile.lookingFor === 'male' ? 'male' : 'female',
                  lang
                );
              }}
              className="w-full py-2.5 px-3   border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white hover:border-red-600 font-mono text-xs flex items-center justify-center gap-2 transition-all"
            >
              <span>🔊</span>
              <span>{lang === 'am' ? 'የድምፅ ቅምሻ አዳምጥ' : 'Test Romantic Voice'}</span>
            </button>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* Re-run Onboarding button */}
          <button
            type="button"
            onClick={() => {
              onClose?.();
              onOpenOnboarding?.();
            }}
            className="w-full py-2.5 px-3   border border-zinc-800 bg-zinc-950 hover:border-red-600 text-zinc-300 hover:text-white font-mono text-xs text-center transition-all"
          >
             {lang === 'am' ? 'የመግቢያ መጠይቅ በድጋሚ ይክፈቱ' : 'Restart "Tell Me About Yourself" Quiz'}
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950/90 border-t border-zinc-800 flex items-center justify-between shrink-0">
          {savedNotice ? (
            <div className="flex items-center gap-1.5 text-red-400 font-mono text-xs font-bold">
              <IconCheck className="w-4 h-4" />
              <span>{lang === 'am' ? 'ተቀምጧል!' : 'Settings Saved!'}</span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-xs text-zinc-400 hover:text-white px-3 py-2   transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="font-mono text-xs font-bold px-5 py-2.5   bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-950/50 transition-all"
            >
              {lang === 'am' ? 'አስቀምጥ' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
