// ─────────────────────────────────────────────────────────────────────────────
// OnboardingModal.jsx — "Tell Me About Yourself" & Partner Preference Setup
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { IconX, IconCheck, IconHeart, IconCode } from '../ui/Icons.jsx';
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
  'Pair Programming & Production Soulmate 💖',
  'Late-Night Debugging Partner ☕',
  'Hackathon & Co-founder Romance 🚀',
  'Deep Conversations Over Ethiopian Bunna 🫘',
  'Casual Chat to Refresh After Coding 💬',
];

export default function OnboardingModal({ isOpen, onClose, userProfile, onSaveProfile, lang = 'en' }) {
  const [profile, setProfile] = useState(() => ({
    name: userProfile?.name || 'CodeSoul',
    emoji: userProfile?.emoji || '🧑‍💻',
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top glow border */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-fuchsia-500 to-cyan-500" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <div>
              <h2 className="font-mono text-base font-bold text-white">
                {lang === 'am' ? 'ስለ እራስዎ ይንገሩን' : 'Tell Me About Yourself'}
              </h2>
              <p className="font-mono text-[11px] text-slate-500">
                {lang === 'am' ? 'የነፍስ ጓደኛዎን ለማግኘት ፕሮፋይል ያዘጋጁ' : 'Customize your developer dating profile'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 py-3 bg-slate-950/50 border-b border-slate-800/80 px-6">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => {
                soundEngine.playHeartbeat();
                setStep(s);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold transition-all ${
                step === s
                  ? 'bg-fuchsia-950 border border-fuchsia-600 text-fuchsia-300 shadow-md shadow-fuchsia-900/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span>{s === 1 ? '1. Preference' : s === 2 ? '2. Identity' : '3. Dev Vibe'}</span>
            </button>
          ))}
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1" style={{ scrollbarWidth: 'thin' }}>
          {/* STEP 1: Preference */}
          {step === 1 && (
            <div className="space-y-4 animate-slide-up">
              <div>
                <label className="font-mono text-xs font-bold text-slate-300 block mb-2">
                  {lang === 'am' ? 'ማንን ማግኘት ይፈልጋሉ?' : 'Who are you looking to find?'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'female', label: 'Girlfriend 👩‍💻', desc: lang === 'am' ? 'የሴት ጓደኛ' : 'Lina, Dani, Senait' },
                    { id: 'male', label: 'Boyfriend 👨‍💻', desc: lang === 'am' ? 'የወንድ ጓደኛ' : 'Linus, Devon, Dawit' },
                    { id: 'all', label: 'Everyone 💖', desc: lang === 'am' ? 'ሁሉንም ማየት' : 'Open to all soulmates' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playHeartbeat();
                        setProfile((p) => ({ ...p, lookingFor: opt.id }));
                      }}
                      className={`p-3.5 rounded-2xl border text-left font-mono transition-all duration-200 ${
                        profile.lookingFor === opt.id
                          ? 'border-fuchsia-500 bg-fuchsia-950/40 text-white shadow-lg shadow-fuchsia-950/50'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <p className="text-sm font-bold">{opt.label}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-slate-300 block mb-2">
                  {lang === 'am' ? 'የግንኙነት ግብ' : 'Your Relationship Goal'}
                </label>
                <div className="space-y-2">
                  {RELATIONSHIP_GOALS.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, goal }))}
                      className={`w-full p-2.5 rounded-xl border text-left font-mono text-xs transition-all ${
                        profile.goal === goal
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
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
                <label className="font-mono text-xs font-bold text-slate-300 block mb-2">
                  {lang === 'am' ? 'የእርስዎ ስም / Handle' : 'Your Name / Dev Handle'}
                </label>
                <div className="flex items-center gap-3">
                  <div className="text-3xl p-2.5 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0">
                    {profile.emoji}
                  </div>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Enter your name or dev handle..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 font-mono text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-slate-300 block mb-2">
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
                      className={`p-2.5 text-2xl rounded-xl border text-center transition-all ${
                        profile.emoji === em
                          ? 'border-fuchsia-500 bg-fuchsia-950/60 scale-110 shadow-md shadow-fuchsia-900/40'
                          : 'border-slate-800 bg-slate-950/80 hover:border-slate-600'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-slate-300 block mb-2">
                  {lang === 'am' ? 'የእርስዎ Dev Archetype' : 'Your Developer Archetype'}
                </label>
                <select
                  value={profile.archetype}
                  onChange={(e) => setProfile((p) => ({ ...p, archetype: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {ARCHETYPES.map((arch) => (
                    <option key={arch} value={arch}>
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
                <label className="font-mono text-xs font-bold text-slate-300 block mb-2">
                  {lang === 'am' ? 'የሚወዱት የቴክኖሎጂ ስብስብ' : 'Favorite Tech Stack'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TECH_STACKS.map((stack) => (
                    <button
                      key={stack}
                      type="button"
                      onClick={() => setProfile((p) => ({ ...p, favoriteStack: stack }))}
                      className={`p-2.5 rounded-xl border text-left font-mono text-xs transition-all ${
                        profile.favoriteStack === stack
                          ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300 font-bold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {stack}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-mono text-xs font-bold text-slate-300 block mb-2">
                  {lang === 'am' ? 'አጭር የፍቅር / የኮዲንግ ማስታወሻ' : 'Short Bio / Dating Note'}
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  rows={3}
                  placeholder="Searching for someone whose code compiles as cleanly as our chemistry..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="font-mono text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg border border-slate-800 hover:bg-slate-900"
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
              className="font-mono text-xs font-bold px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40"
            >
              Next Step →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="font-mono text-xs font-bold px-6 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white shadow-lg shadow-fuchsia-950/50 flex items-center gap-2"
            >
              <IconHeart className="w-4 h-4" />
              <span>{lang === 'am' ? 'አስቀምጥና ጀምር 🚀' : 'Save & Find Soulmate 🚀'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
