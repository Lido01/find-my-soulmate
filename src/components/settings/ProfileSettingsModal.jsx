// ─────────────────────────────────────────────────────────────────────────────
// ProfileSettingsModal.jsx — Complete Profile, Audio & Voice Settings
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { IconX, IconCheck, IconUser, IconHeart } from '../ui/Icons.jsx';
import { soundEngine } from '../../utils/audio.js';

export default function ProfileSettingsModal({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  audioSettings,
  onSaveAudioSettings,
  onOpenOnboarding,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700  shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconUser className="w-5 h-5 text-cyan-400" />
            <h2 className="font-mono text-base font-bold text-white">
              {lang === 'am' ? 'የመገለጫ እና የድምፅ ቅንብሮች' : 'Profile & Audio Settings'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1  hover:bg-slate-800 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1" style={{ scrollbarWidth: 'thin' }}>
          {/* Section 1: User Profile */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">
              // {lang === 'am' ? 'የእርስዎ መገለጫ' : 'Dev Profile'}
            </h3>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={profile.emoji || '🧑‍💻'}
                onChange={(e) => setProfile((p) => ({ ...p, emoji: e.target.value }))}
                className="w-12 h-12 bg-slate-950 border border-slate-700  text-center text-2xl focus:border-cyan-500 focus:outline-none"
                title="Profile Emoji"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={profile.name || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Your Name"
                  className="w-full bg-slate-950 border border-slate-700  px-3 py-2 font-mono text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[11px] text-slate-500 block mb-1">
                  {lang === 'am' ? 'አርኬታይፕ' : 'Archetype'}
                </label>
                <input
                  type="text"
                  value={profile.archetype || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, archetype: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800  px-2.5 py-1.5 font-mono text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-mono text-[11px] text-slate-500 block mb-1">
                  {lang === 'am' ? 'ቴክ ስብስብ' : 'Tech Stack'}
                </label>
                <input
                  type="text"
                  value={profile.favoriteStack || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, favoriteStack: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800  px-2.5 py-1.5 font-mono text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Looking For Gender Filter */}
            <div>
              <label className="font-mono text-[11px] text-slate-500 block mb-1.5">
                {lang === 'am' ? 'የፍለጋ ምርጫ' : 'Looking to Find'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'female', label: 'Girlfriend 👩‍💻' },
                  { id: 'male', label: 'Boyfriend 👨‍💻' },
                  { id: 'all', label: 'Everyone 💖' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setProfile((p) => ({ ...p, lookingFor: opt.id }))}
                    className={`py-2 px-1 text-center  font-mono text-xs border transition-all ${
                      profile.lookingFor === opt.id
                        ? 'border-fuchsia-500 bg-fuchsia-950/50 text-fuchsia-300 font-bold'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          {/* Section 2: Audio & Romantic Voice */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest">
              // {lang === 'am' ? 'የድምፅ እና የሮማንቲክ ኦዲዮ ቅንብር' : 'Audio & Voice Synthesis'}
            </h3>

            {/* Voice narration toggle */}
            <div className="flex items-center justify-between p-3  bg-slate-950 border border-slate-800">
              <div>
                <p className="font-mono text-xs font-bold text-slate-200">
                  {lang === 'am' ? 'የገፀ-ባህሪያት ድምፅ ንግግር' : 'Romantic Voice Narration (TTS)'}
                </p>
                <p className="font-mono text-[11px] text-slate-500">
                  {lang === 'am' ? 'ገፀ-ባህሪያት መልእክታቸውን በድምፅ ያሰማሉ' : 'Partners speak their messages with realistic audio'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAudio((a) => ({ ...a, voiceNarration: !a.voiceNarration }))}
                className={`w-12 h-6  transition-colors relative p-0.5 ${
                  audio.voiceNarration ? 'bg-fuchsia-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5  bg-white transition-transform ${
                    audio.voiceNarration ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Romantic sound effects toggle */}
            <div className="flex items-center justify-between p-3  bg-slate-950 border border-slate-800">
              <div>
                <p className="font-mono text-xs font-bold text-slate-200">
                  {lang === 'am' ? 'የፍቅር ድምፆች (Chimes & Pulse)' : 'Romantic Audio Chimes & Beeps'}
                </p>
                <p className="font-mono text-[11px] text-slate-500">
                  {lang === 'am' ? 'ለስላሳ የልብ ምት እና የደስታ ዜማዎች' : 'Web Audio chords on messages and gifts'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAudio((a) => ({ ...a, soundEffects: !a.soundEffects }))}
                className={`w-12 h-6  transition-colors relative p-0.5 ${
                  audio.soundEffects ? 'bg-emerald-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5  bg-white transition-transform ${
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
              className="w-full py-2 px-3  border border-slate-800 bg-slate-950/80 hover:bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center gap-2"
            >
              <span>🔊</span>
              <span>{lang === 'am' ? 'የድምፅ ቅምሻ አዳምጥ' : 'Test Romantic Voice'}</span>
            </button>
          </div>

          <div className="h-px bg-slate-800" />

          {/* Re-run Onboarding button */}
          <button
            type="button"
            onClick={() => {
              onClose?.();
              onOpenOnboarding?.();
            }}
            className="w-full py-2.5 px-3  border border-fuchsia-800/40 bg-fuchsia-950/20 hover:bg-fuchsia-900/40 text-fuchsia-300 font-mono text-xs text-center"
          >
             {lang === 'am' ? 'የመግቢያ መጠይቅ በድጋሚ ይክፈቱ' : 'Restart "Tell Me About Yourself" Quiz'}
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {savedNotice ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs">
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
              className="font-mono text-xs text-slate-400 hover:text-white px-3 py-2 "
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="font-mono text-xs font-bold px-5 py-2.5  bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-950/50"
            >
              {lang === 'am' ? 'አስቀምጥ' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
