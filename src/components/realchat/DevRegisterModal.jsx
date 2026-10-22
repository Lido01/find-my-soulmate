// ─────────────────────────────────────────────────────────────────────────────
// DevRegisterModal.jsx — Developer Dating Registration & Criteria Setup Modal
// Step 1: Choose Girlfriend or Boyfriend first
// Step 2: "Tell Me About Yourself" & developer criteria setup
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { IconX, IconCheck, IconChevronRight } from '../ui/Icons.jsx';
import { soundEngine } from '../../utils/audio.js';
import { wsService } from '../../services/websocket.js';

const AVAILABLE_STACKS = [
  'React', 'TypeScript', 'Next.js', 'Rust', 'Python', 'Go', 
  'Linux', 'Tailwind', 'Node.js', 'PyTorch', 'Vue', 'Flutter',
  'Svelte', 'Docker', 'GraphQL', 'PostgreSQL'
];

const EMOJI_OPTIONS = ['👩‍💻', '👨‍💻', '💻', '⚡', '☕', '🚀', '🧠', '✨', '🔥', '🌸'];

export default function DevRegisterModal({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
  onStartChatNow,
  lang = 'en',
}) {
  const isAm = lang === 'am';

  // If already registered, start on step 2; otherwise start on step 1 (choose BF/GF)
  const [step, setStep] = useState(() => (currentProfile?.isRegistered ? 2 : 1));

  const [name, setName] = useState(currentProfile?.name || '');
  const [handle, setHandle] = useState(currentProfile?.handle || '');
  const [gender, setGender] = useState(currentProfile?.gender || 'male');
  const [lookingFor, setLookingFor] = useState(currentProfile?.lookingFor || 'female');
  const [location, setLocation] = useState(currentProfile?.location || 'Addis Ababa 🇪🇹');
  const [bio, setBio] = useState(currentProfile?.bio || '');
  const [indentation, setIndentation] = useState(currentProfile?.indentation || 'Tabs');
  const [drink, setDrink] = useState(currentProfile?.drink || '☕ Ethiopian Bunna');
  const [emoji, setEmoji] = useState(currentProfile?.emoji || '🧑‍💻');
  const [techStack, setTechStack] = useState(currentProfile?.techStack || ['React', 'TypeScript']);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  function handleSelectTarget(target) {
    soundEngine.playRomanticChime();
    setLookingFor(target);
    setGender(target === 'female' ? 'male' : 'female');
    setStep(2);
  }

  function toggleTech(tech) {
    if (techStack.includes(tech)) {
      if (techStack.length > 1) {
        setTechStack(techStack.filter((t) => t !== tech));
      }
    } else {
      if (techStack.length < 5) {
        setTechStack([...techStack, tech]);
      }
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    soundEngine.playHeartbeat();

    const finalHandle = handle.trim().startsWith('@')
      ? handle.trim()
      : `@${handle.trim() || name.trim().toLowerCase().replace(/\s+/g, '_')}`;

    const profileData = {
      id: currentProfile?.id || `dev_${Date.now()}`,
      name: name.trim(),
      handle: finalHandle,
      gender,
      lookingFor,
      location: location.trim() || 'Addis Ababa 🇪🇹',
      bio: bio.trim() || (isAm ? 'ስለ ኮድ እና ቡና ማውራት እወዳለሁ።' : 'Passionate developer looking for genuine connection.'),
      indentation,
      drink,
      emoji,
      techStack,
      isRegistered: true,
      registeredAt: new Date().toISOString(),
    };

    // Save to backend database & WebSocket
    await wsService.registerInBackend(profileData);
    onSaveProfile?.(profileData);

    soundEngine.playGiftFanfare();
    setSuccessMsg(
      isAm
        ? "🎉 በተሳካ ሁኔታ ተመዝግቧል! አሁን መፈለግ ጀምረዋል..."
        : "🎉 Profile saved! Launching your soulmate discovery..."
    );

    setTimeout(() => {
      setIsSaving(false);
      setSuccessMsg('');
      onClose?.();
      onStartChatNow?.();
    }, 1000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in font-mono"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="w-full max-w-lg max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">
              {step === 1 ? (isAm ? "ደረጃ 1" : "Step 1 of 2") : (isAm ? "ደረጃ 2" : "Step 2 of 2")}
            </span>
            <h2 className="text-base sm:text-lg font-black text-white">
              {step === 1
                ? (isAm ? "ማንን ማግኘት ይፈልጋሉ?" : "Who are you looking for?")
                : (isAm ? "ስለ እርስዎ ይንገሩን" : "Tell Me About Yourself")}
            </h2>
          </div>

          {currentProfile?.isRegistered && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <IconX className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* ── STEP 1: CHOOSE BF OR GF FIRST ─────────────────────────────────── */}
        {step === 1 && (
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
            <p className="text-xs text-slate-400 text-center max-w-sm mx-auto">
              {isAm
                ? "በመጀመሪያ የሚፈልጉትን ይምረጡ፤ በመቀጠል ስለ እርስዎ አጭር መግለጫ ያስገባሉ።"
                : "Choose who you want to meet first, then create your developer dating profile to get matched."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {/* Option: Girlfriend */}
              <button
                type="button"
                onClick={() => handleSelectTarget('female')}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500 hover:bg-slate-900/90 text-left transition-all group flex flex-col justify-between space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-800">👩‍💻</span>
                  <span className="text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {isAm ? "የሴት ጓደኛ (Girlfriend)" : "Find a Girlfriend 👩‍💻"}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isAm ? "ከብልህ ሴት ገንቢዎች ጋር ይገናኙ" : "Match with talented, passionate female developers."}
                  </p>
                </div>
              </button>

              {/* Option: Boyfriend */}
              <button
                type="button"
                onClick={() => handleSelectTarget('male')}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500 hover:bg-slate-900/90 text-left transition-all group flex flex-col justify-between space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2 rounded-xl bg-slate-900 border border-slate-800">👨‍💻</span>
                  <span className="text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {isAm ? "የወንድ ጓደኛ (Boyfriend)" : "Find a Boyfriend 👨‍💻"}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isAm ? "ከብልህ ወንድ ገንቢዎች ጋር ይገናኙ" : "Match with skilled, dedicated male developers."}
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: TELL ME ABOUT YOURSELF ─────────────────────────────────── */}
        {step === 2 && (
          <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
            {/* Preference Badge / Change Button */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">
                  {isAm ? "የተመረጠ:" : "Looking for:"}
                </span>
                <span className="font-bold text-cyan-300">
                  {lookingFor === 'female' ? 'Girlfriend 👩‍💻' : 'Boyfriend 👨‍💻'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[11px] text-slate-400 hover:text-white underline font-bold"
              >
                {isAm ? "ቀይር" : "Change"}
              </button>
            </div>

            {/* Name & Handle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">
                  {isAm ? "ስምዎ" : "Your Name"} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dawit, Meron, Alex"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">
                  {isAm ? "የተጠቃሚ መለያ" : "Handle / Nickname"}
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@your_handle"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Tell Me About Yourself (Bio) */}
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">
                {isAm ? "ስለ እርስዎ ይንገሩን (Tell Me About Yourself)" : "Tell Me About Yourself (Bio)"} *
              </label>
              <textarea
                rows={2}
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={
                  isAm
                    ? "ለምሳሌ: ማታ ማታ React እና Python ላይ መስራት ደስ ይለኛል፣ ቡና አፍቃሪ ነኝ..."
                    : "e.g. Late night frontend builder, coffee enthusiast, looking for deep conversations and clean code..."
                }
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Tech Stack Pills */}
            <div className="space-y-1">
              <label className="text-slate-300 font-bold flex items-center justify-between">
                <span>{isAm ? "የሚሰሩባቸው ቴክኖሎጂዎች" : "Your Tech Stack (Pick up to 5)"}</span>
                <span className="text-[10px] text-cyan-400">{techStack.length}/5 selected</span>
              </label>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {AVAILABLE_STACKS.map((tech) => {
                  const selected = techStack.includes(tech);
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTech(tech)}
                      className={`px-2.5 py-1 rounded-lg border font-bold transition-all text-[11px] ${
                        selected
                          ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tech}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tabs vs Spaces & Fuel */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Indentation</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Tabs', 'Spaces'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setIndentation(opt)}
                      className={`py-1.5 rounded-lg border text-center font-bold ${
                        indentation === opt
                          ? 'bg-slate-800 border-cyan-500 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Favorite Fuel</label>
                <select
                  value={drink}
                  onChange={(e) => setDrink(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none"
                >
                  <option value="☕ Ethiopian Bunna">☕ Ethiopian Bunna</option>
                  <option value="☕ Espresso">☕ Espresso</option>
                  <option value="🍵 Green Tea">🍵 Green Tea</option>
                  <option value="🥤 Cold Brew">🥤 Cold Brew</option>
                </select>
              </div>
            </div>

            {/* Success Banner */}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-300 font-bold text-xs animate-bounce-in flex items-center gap-2">
                <span>✓</span>
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!name.trim() || isSaving}
                className={`w-full py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-xs ${
                  isSaving
                    ? 'bg-slate-800 text-slate-400 cursor-wait'
                    : 'bg-cyan-950 hover:bg-cyan-900 border border-cyan-600 text-cyan-200 cursor-pointer'
                }`}
              >
                <span>{isSaving ? '⏳' : '🚀'}</span>
                <span>
                  {isSaving
                    ? (isAm ? 'እየተመዘገበ ነው...' : 'Saving...')
                    : (isAm ? 'ተጠናቋል — መፈለግ ጀምር' : 'Complete & Start Soulmate Discovery')}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
