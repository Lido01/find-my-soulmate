// ─────────────────────────────────────────────────────────────────────────────
// ProfileSettingsModal.jsx — Complete Profile, Audio & Voice Settings
// High-tech Red, Black & White developer theme with Space Grotesk / JetBrains Mono
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { IconX, IconCheck, IconUser } from '../ui/Icons.jsx';
import { soundEngine } from '../../utils/audio.js';
import { wsService } from '../../services/websocket.js';

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
  const isAm = lang === 'am';
  const [profile, setProfile] = useState({ ...userProfile });
  const [audio, setAudio] = useState({ ...audioSettings });
  const [savedNotice, setSavedNotice] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const fileInputRef = useRef(null);

  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 360;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        setProfile((prev) => ({
          ...prev,
          avatarUrl: compressed,
          avatarData: compressed,
        }));
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    setProfile((prev) => ({
      ...prev,
      avatarUrl: null,
      avatarData: null,
    }));
  }

  useEffect(() => {
    if (userProfile) {
      setProfile({ ...userProfile });
    }
  }, [isOpen, userProfile]);

  if (!isOpen) return null;

  function handleCopyLoveCode() {
    soundEngine.playRomanticChime();
    const code = profile?.loveCode || userProfile?.loveCode;
    if (code && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2400);
    }
  }

  async function handleSave() {
    soundEngine.enabled = audio.soundEffects;
    soundEngine.voiceEnabled = audio.voiceNarration;
    soundEngine.voiceVolume = audio.volume;

    onSaveProfile?.(profile);
    onSaveAudioSettings?.(audio);

    // Persist to backend database & Supabase
    try {
      await wsService.registerProfile(profile);
    } catch (err) {
      console.warn('Profile sync warning:', err);
    }

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
      <div className="relative w-full max-w-lg bg-black border border-zinc-800 rounded-xl shadow-2xl shadow-red-950/40 overflow-hidden flex flex-col max-h-[92vh] animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-red-950/70 border border-red-600/50 text-red-400">
              <IconUser className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-heading text-base font-bold text-white">
                {isAm ? 'የመገለጫ እና የድምፅ ቅንብሮች' : 'My Dev Profile & Settings'}
              </h2>
              <p className="text-[10px] text-zinc-500 font-mono">View & Edit Profile, Love Code Key, Audio & Match Filters</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-red-600 transition-colors"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-black" style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a transparent' }}>
          
          {/* Section 1: User Profile & Love Code */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs font-bold text-red-400 uppercase tracking-widest">
                // {isAm ? 'የገንቢ መገለጫዎ' : 'Developer Identity'}
              </h3>
              {profile.isRegistered && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950/80 border border-red-600/60 text-red-300">
                  ✓ Registered Dev
                </span>
              )}
            </div>

            {/* Permanent Love Code Card with 1-click Copy */}
            {(profile.loveCode || userProfile?.loveCode) && (
              <div className="p-3.5 bg-zinc-950 border border-red-600/60 rounded-xl flex items-center justify-between gap-3 shadow-inner">
                <div className="min-w-0">
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">
                    🔑 {isAm ? 'የእርስዎ ቋሚ Love Code (የመግቢያ ቁልፍ)' : 'Permanent Love Code (Login Key)'}
                  </span>
                  <span className="font-mono text-sm sm:text-base font-black text-white tracking-widest block truncate select-all">
                    {profile.loveCode || userProfile?.loveCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLoveCode}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    copiedCode
                      ? 'bg-zinc-800 text-red-400 border border-red-500'
                      : 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                  }`}
                >
                  <span>{copiedCode ? '✓' : '📋'}</span>
                  <span>{copiedCode ? (isAm ? 'ተቀድቷል' : 'Copied') : (isAm ? 'ቅዳ' : 'Copy')}</span>
                </button>
              </div>
            )}

            {/* Photo Avatar Uploader & Emoji Picker */}
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2.5">
              <label className="font-mono text-[11px] text-zinc-400 block font-bold">
                {isAm ? 'የመገለጫ ፎቶ እና ኢሞጂ' : 'Profile Picture & Emoji Avatar'}
              </label>

              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-lg bg-black border-2 border-red-600 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                  {profile.avatarUrl || profile.avatarData ? (
                    <img
                      src={profile.avatarUrl || profile.avatarData}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">{profile.emoji || '🧑‍💻'}</span>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <span>📷</span>
                      <span>{profile.avatarUrl || profile.avatarData ? (isAm ? 'ፎቶ ቀይር' : 'Change Photo') : (isAm ? 'ፎቶ ስቀል' : 'Upload Photo')}</span>
                    </button>
                    {(profile.avatarUrl || profile.avatarData) && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        {isAm ? 'አስወግድ' : 'Remove Photo'}
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-sans">
                    {isAm ? 'የተሰቀለው ፎቶ በሌሎች ተጠቃሚዎች ዝርዝር ላይ ወዲያውኑ ይታያል' : 'Compressed for instant viewing across the platform.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Name, Handle & Emoji */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={profile.emoji || '🧑‍💻'}
                  onChange={(e) => setProfile((p) => ({ ...p, emoji: e.target.value }))}
                  className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-lg text-center text-2xl focus:border-red-500 focus:outline-none"
                  title="Profile Emoji"
                />
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={profile.name || ''}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your Name"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 font-mono text-xs text-white focus:border-red-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={profile.handle || ''}
                    onChange={(e) => setProfile((p) => ({ ...p, handle: e.target.value }))}
                    placeholder="@handle"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-1.5 font-mono text-[11px] text-zinc-400 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bio Field */}
              <div className="space-y-1">
                <label className="font-mono text-[11px] text-zinc-400 block font-bold">
                  {isAm ? 'ስለ እርስዎ (Bio)' : 'Bio / About You'}
                </label>
                <textarea
                  rows={2}
                  value={profile.bio || ''}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell other developers about yourself and your passions..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-xs text-white focus:border-red-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Tech Stack & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[11px] text-zinc-400 block mb-1">
                    {isAm ? 'ቴክ ስብስብ' : 'Tech Stack (comma separated)'}
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(profile.techStack) ? profile.techStack.join(', ') : (profile.favoriteStack || '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      const arr = val.split(',').map((s) => s.trim()).filter(Boolean);
                      setProfile((p) => ({ ...p, techStack: arr, favoriteStack: val }));
                    }}
                    placeholder="React, TypeScript, Python"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-xs text-zinc-300 focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-mono text-[11px] text-zinc-400 block mb-1">
                    {isAm ? 'የመኖሪያ ቦታ' : 'Location'}
                  </label>
                  <input
                    type="text"
                    value={profile.location || ''}
                    onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                    placeholder="Addis Ababa 🇪🇹"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-xs text-zinc-300 focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Indentation & Favorite Drink */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[11px] text-zinc-400 block mb-1">Indentation</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['Tabs', 'Spaces'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setProfile((p) => ({ ...p, indentation: opt }))}
                        className={`py-1.5 rounded-lg border text-center font-bold text-xs ${
                          profile.indentation === opt
                            ? 'bg-red-950/70 border-red-600 text-white'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[11px] text-zinc-400 block mb-1">Fuel / Drink</label>
                  <select
                    value={profile.drink || '☕ Ethiopian Bunna'}
                    onChange={(e) => setProfile((p) => ({ ...p, drink: e.target.value }))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none"
                  >
                    <option value="☕ Ethiopian Bunna">☕ Ethiopian Bunna</option>
                    <option value="☕ Espresso">☕ Espresso</option>
                    <option value="🍵 Green Tea">🍵 Green Tea</option>
                    <option value="🥤 Cold Brew">🥤 Cold Brew</option>
                    <option value="💧 Pure Water">💧 Pure Water</option>
                  </select>
                </div>
              </div>

              {/* Looking For Gender Filter */}
              <div>
                <label className="font-mono text-[11px] text-zinc-400 block mb-1.5 font-bold">
                  {isAm ? 'የፍለጋ ምርጫ' : 'Looking to Find'}
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
                      className={`py-2 px-1 text-center rounded-lg font-mono text-xs border transition-all ${
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

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-2 pt-1 text-center font-mono">
                <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <span className="text-[10px] text-zinc-500 block">Likes</span>
                  <span className="text-xs font-bold text-red-400">❤️ {profile.likes || 1}</span>
                </div>
                <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <span className="text-[10px] text-zinc-500 block">Followers</span>
                  <span className="text-xs font-bold text-white">{(profile.followers || []).length}</span>
                </div>
                <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <span className="text-[10px] text-zinc-500 block">Following</span>
                  <span className="text-xs font-bold text-white">{(profile.following || []).length}</span>
                </div>
                <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <span className="text-[10px] text-zinc-500 block">Friends</span>
                  <span className="text-xs font-bold text-white">{(profile.friends || []).length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* Section 2: Audio & Romantic Voice */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs font-bold text-red-400 uppercase tracking-widest">
              // {isAm ? 'የድምፅ እና የሮማንቲክ ኦዲዮ ቅንብር' : 'Audio & Voice Synthesis'}
            </h3>

            {/* Appearance / Theme Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <div>
                <p className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{isAm ? 'የገጽታ ቀለም (Theme)' : 'Theme Appearance'}</span>
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
                className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition-all flex items-center gap-1.5 ${
                  theme === 'light'
                    ? 'bg-red-600 text-white border-red-500 shadow-sm'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white'
                }`}
              >
                <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>

            {/* Voice narration toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <div>
                <p className="font-mono text-xs font-bold text-white">
                  {isAm ? 'የገፀ-ባህሪያት ድምፅ ንግግር' : 'Romantic Voice Narration (TTS)'}
                </p>
                <p className="font-mono text-[11px] text-zinc-500">
                  {isAm ? 'ገፀ-ባህሪያት መልእክታቸውን በድምፅ ያሰማሉ' : 'Partners speak their messages with realistic audio'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAudio((a) => ({ ...a, voiceNarration: !a.voiceNarration }))}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  audio.voiceNarration ? 'bg-red-600' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    audio.voiceNarration ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Romantic sound effects toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <div>
                <p className="font-mono text-xs font-bold text-white">
                  {isAm ? 'የፍቅር ድምፆች (Chimes & Pulse)' : 'Romantic Audio Chimes & Beeps'}
                </p>
                <p className="font-mono text-[11px] text-zinc-500">
                  {isAm ? 'ለስላሳ የልብ ምት እና የደስታ ዜማዎች' : 'Web Audio chords on messages and gifts'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAudio((a) => ({ ...a, soundEffects: !a.soundEffects }))}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  audio.soundEffects ? 'bg-red-600' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
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
              className="w-full py-2.5 px-3 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white hover:border-red-600 font-mono text-xs flex items-center justify-center gap-2 transition-all"
            >
              <span>🔊</span>
              <span>{isAm ? 'የድምፅ ቅምሻ አዳምጥ' : 'Test Romantic Voice'}</span>
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
            className="w-full py-2.5 px-3 rounded-lg border border-zinc-800 bg-zinc-950 hover:border-red-600 text-zinc-300 hover:text-white font-mono text-xs text-center transition-all"
          >
             {isAm ? 'የመግቢያ መጠይቅ በድጋሚ ይክፈቱ' : 'Restart "Tell Me About Yourself" Quiz'}
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950/90 border-t border-zinc-800 flex items-center justify-between shrink-0">
          {savedNotice ? (
            <div className="flex items-center gap-1.5 text-red-400 font-mono text-xs font-bold">
              <IconCheck className="w-4 h-4" />
              <span>{isAm ? 'ተቀምጧል!' : 'Profile & Settings Saved!'}</span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="font-mono text-xs text-zinc-400 hover:text-white px-3 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="font-mono text-xs font-bold px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-950/50 transition-all cursor-pointer"
            >
              {isAm ? 'አስቀምጥ' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
