// ─────────────────────────────────────────────────────────────────────────────
// OnboardingModal.jsx — "Tell Me About Yourself" & Partner Preference Setup
// High-tech Red, Black & White developer theme with Space Grotesk / JetBrains Mono
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { IconX, IconHeart } from '../ui/Icons.jsx';
import { soundEngine } from '../../utils/audio.js';

const EMOJI_OPTIONS = ['🧑‍💻', '👩‍💻', '👨‍💻', '🤖', '🧙‍♂️', '🦊', '☕', '⚡', '🥷', '🦀', '💻', '✨'];

const ARCHETYPES = [
  'Full-Stack Dreamer',
  'Frontend CSS Wizard',
  'Backend Architecture Guru',
  'DevOps & Cloud Sorcerer',
  'AI & Neural Net Researcher',
  'Vim & Kernel Hacker',
  'Casual Bug Fixer & Coffee Lover',
];

const TECH_STACKS = [
  'TypeScript & React',
  'Python & PyTorch',
  'Rust & Systems',
  'Go & Microservices',
  'Linux & C / C++',
  'Svelte & Tailwind',
  'Flutter & Mobile',
  'Next.js & Node',
];

const RELATIONSHIP_GOALS = [
  'Pair Programming & Production Soulmate',
  'Late-Night Debugging Partner',
  'Hackathon & Co-founder Romance',
  'Deep Conversations Over Ethiopian Bunna',
  'Casual Chat to Refresh After Coding',
];

export default function OnboardingModal({ isOpen, onClose, userProfile, onSaveProfile, lang = 'en' }) {
  const [profile, setProfile] = useState(() => ({
    name: userProfile?.name || 'CodeSoul',
    emoji: userProfile?.emoji,
    archetype: userProfile?.archetype || ARCHETYPES[0],
    favoriteStack: userProfile?.favoriteStack || TECH_STACKS[0],
    lookingFor: userProfile?.lookingFor || 'all',
    goal: userProfile?.goal || RELATIONSHIP_GOALS[0],
    bio: userProfile?.bio || '',
  }));

  const [step, setStep] = useState(1);

  if (!isOpen) return null;

  function handleSave() {
    soundEngine.playRomanticChime();
    onSaveProfile?.(profile);
    onClose?.();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in font-mono select-text"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="relative w-full max-w-lg bg-black border border-zinc-800   shadow-2xl shadow-red-950/40 overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
        {/* Top glow border */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-700 via-red-500 to-white" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/90 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-heading text-base font-bold text-white">
              {lang === 'am' ? 'ስለ እራስዎ ይንገሩን' : 'Tell Me About Yourself'}
            </h2>
            <p className="font-mono text-[11px] text-zinc-500">
              {lang === 'am' ? 'የነፍስ ጓደኛዎን ለማግኘት ፕሮፋይል ያዘጋጁ' : 'Customize your developer dating profile'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5   bg-zinc-900 border border-zinc-800 hover:border-red-600 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-3 bg-zinc-950/70 border-b border-zinc-800/80 px-6 shrink-0">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                soundEngine.playHeartbeat();
                setStep(s);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5   font-mono text-xs font-bold transition-all ${
                step === s
                  ? 'bg-red-600 text-white border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                  : 'bg-zinc-950 text-zinc-500 border border-zinc-800 hover:text-white'
              }`}
            >
              <span>{s === 1 ? '1. Preference' : s === 2 ? '2. Identity' : '3. Dev Vibe'}</span>
            </button>
          ))}
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-black" style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a transparent' }}>
          {/* STEP 1: Preference */}
          {step === 1 && (
            <div className="space-y-4 animate-slide-up">
              <div>
                <label className="font-mono text-xs font-bold text-zinc-300 block mb-2">
                  {lang === 'am' ? 'ማንን ማግኘት ይፈልጋሉ?' : 'Who are you looking to find?'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'female', label: 'Girlfriend', desc: lang === 'am' ? 'የሴት ጓደኛ' : 'Lina, Dani, Senait' },
                    { id: 'male', label: 'Boyfriend', desc: lang === 'am' ? 'የወንድ ጓደኛ' : 'Linus, Devon, Dawit' },
                    { id: 'all', label: 'Everyone', desc: lang === 'am' ? 'ሁሉንም ማየት' : 'Open to all soulmates' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playHeartbeat();
                        setProfile((p) => ({ ...p, lookingFor: opt.id }));
                      }}
                      className={`p-3.5   border text-left font-mono transition-all duration-200 ${
                        profile.lookingFor === opt.id
                          ? 'border-red-500 bg-red-950/60 text-white shadow-lg shadow-red-950/50'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <p className="text-sm font-bold text-white">{opt.label}</p>
                      <p className="text-[11px] text-zinc-400 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-zinc-300 block mb-2">
                  {lang === 'am' ? 'የግንኙነት ግብ' : 'Your Relationship Goal'}
                </label>
                <div className="space-y-2">
                  {RELATIONSHIP_GOALS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, goal }))}
                      className={`w-full p-3   border text-left font-mono text-xs transition-all ${
                        profile.goal === goal
                          ? 'border-red-500 bg-red-950/50 text-white font-bold'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Identity & Avatar */}
          {step === 2 && (
            <div className="space-y-4 animate-slide-up">
              <div>
                <label className="font-mono text-xs font-bold text-zinc-300 block mb-2">
                  {lang === 'am' ? 'የእርስዎ ስም / Handle' : 'Your Name / Dev Handle'}
                </label>
                <div className="flex items-center gap-3">
                  <div className="text-3xl p-2   bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                    {profile.emoji}
                  </div>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Enter your name or dev handle..."
                    className="flex-1 bg-zinc-950 border border-zinc-800   px-3.5 py-2.5 font-mono text-sm text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-zinc-300 block mb-2">
                  {lang === 'am' ? 'የእርስዎን Avatar Emoji ይምረጡ' : 'Choose Your Avatar Emoji'}
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => {
                        soundEngine.playMessageBeep();
                        setProfile((p) => ({ ...p, emoji: em }));
                      }}
                      className={`p-2.5 text-2xl   border text-center transition-all ${
                        profile.emoji === em
                          ? 'border-red-500 bg-red-950/60 scale-110 shadow-md shadow-red-950/50'
                          : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-zinc-300 block mb-2">
                  {lang === 'am' ? 'የእርስዎ Dev Archetype' : 'Your Developer Archetype'}
                </label>
                <select
                  value={profile.archetype}
                  onChange={(e) => setProfile((p) => ({ ...p, archetype: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800   px-3.5 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-red-500"
                >
                  {ARCHETYPES.map((arch) => (
                    <option key={arch} value={arch} className="bg-black text-white">
                      {arch}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Tech Stack & Vibe */}
          {step === 3 && (
            <div className="space-y-4 animate-slide-up">
              <div>
                <label className="font-mono text-xs font-bold text-zinc-300 block mb-2">
                  {lang === 'am' ? 'የሚወዱት የቴክኖሎጂ ስብስብ' : 'Favorite Tech Stack'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TECH_STACKS.map((stack) => (
                    <button
                      key={stack}
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, favoriteStack: stack }))}
                      className={`p-3   border text-left font-mono text-xs transition-all ${
                        profile.favoriteStack === stack
                          ? 'border-red-500 bg-red-950/60 text-white font-bold'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {stack}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-zinc-300 block mb-2">
                  {lang === 'am' ? 'አጭር የፍቅር / የኮዲንግ ማስታወሻ' : 'Short Bio / Dating Note'}
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  placeholder="Searching for someone whose code compiles as cleanly as our chemistry..."
                  className="w-full bg-zinc-950 border border-zinc-800   p-3 font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-zinc-950/90 border-t border-zinc-800 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="font-mono text-xs text-zinc-400 hover:text-white px-3.5 py-2   border border-zinc-800 hover:bg-zinc-900 transition-colors"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                soundEngine.playHeartbeat();
                setStep((s) => s + 1);
              }}
              className="font-mono text-xs font-bold px-5 py-2.5   bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-950/40 transition-all"
            >
              Next Step →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="font-mono text-xs font-bold px-6 py-2.5   bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-950/50 flex items-center gap-2 transition-all"
            >
              <IconHeart className="w-4 h-4" />
              <span>{lang === 'am' ? 'አስቀምጥና ጀምር' : 'Save & Find Soulmate'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
