// ─────────────────────────────────────────────────────────────────────────────
// DevRegisterModal.jsx — Developer Dating Registration & Criteria Setup Modal
// Allows developers to register their dating profile, tell about themselves,
// select tech stack, coding style, and dating preferences.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { IconX, IconCheck } from '../ui/Icons.jsx';
import { soundEngine } from '../../utils/audio.js';
import { wsService } from '../../services/websocket.js';

const AVAILABLE_STACKS = [
  'React', 'TypeScript', 'Next.js', 'Rust', 'Python', 'Go', 
  'Linux', 'Tailwind', 'Node.js', 'PyTorch', 'Vue', 'Flutter',
  'Svelte', 'Docker', 'GraphQL', 'PostgreSQL'
];

const EMOJI_OPTIONS = ['👩‍💻', '👨‍💻', '💻', '⚡', '☕', '🚀', '🧠', '✨', '🔥', '🌸', '🫀', '🦄'];

export default function DevRegisterModal({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
  onStartChatNow,
  lang = 'en',
}) {
  const isAm = lang === 'am';

  const [name, setName] = useState(currentProfile?.name || '');
  const [handle, setHandle] = useState(currentProfile?.handle || '');
  const [gender, setGender] = useState(currentProfile?.gender || 'female');
  const [lookingFor, setLookingFor] = useState(currentProfile?.lookingFor || (currentProfile?.gender === 'female' ? 'male' : 'female'));
  const [location, setLocation] = useState(currentProfile?.location || 'Addis Ababa 🇪🇹');
  const [bio, setBio] = useState(currentProfile?.bio || '');
  const [indentation, setIndentation] = useState(currentProfile?.indentation || 'Tabs');
  const [drink, setDrink] = useState(currentProfile?.drink || '☕ Ethiopian Bunna');
  const [emoji, setEmoji] = useState(currentProfile?.emoji || (currentProfile?.gender === 'female' ? '👩‍💻' : '👨‍💻'));
  const [techStack, setTechStack] = useState(currentProfile?.techStack || ['React', 'TypeScript']);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

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
      location: location.trim() || 'Online 🌍',
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
        ? "🎉 በዳታቤዝ ውስጥ ተመዝግቧል! አሁን ከገንቢ ጓደኞች ጋር መገናኘት ይጀምሩ..."
        : "🎉 Saved to Backend Database! Launching your new developer chat now..."
    );

    setTimeout(() => {
      setIsSaving(false);
      setSuccessMsg('');
      onClose?.();
      onStartChatNow?.();
    }, 1100);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="w-full max-w-xl max-h-[92vh] bg-slate-900 border border-slate-700  shadow-2xl flex flex-col overflow-hidden animate-scale-up font-mono">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{isAm ? "የገንቢ የፍቅር ካርድዎን ይመዝግቡ" : "Register Developer Dating Card"}</span>
                <span className="text-[10px] px-2 py-0.5  bg-cyan-950 border border-cyan-700 text-cyan-300 font-bold">
                  Live WS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAm ? "ስለራስዎ ይንገሩን እና ተስማሚ የነፍስ ጓደኛዎን ያግኙ" : "Tell about yourself & let compatible devs discover you"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2  text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {/* Avatar Emoji & Basic Info Row */}
          <div className="space-y-2">
            <label className="text-slate-300 font-bold uppercase tracking-wider block">
              1. {isAm ? "የአቫታር ስሜት ገላጭ ምስል (Avatar Emoji)" : "Avatar Emoji"}
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setEmoji(em)}
                  className={`text-2xl p-2  border transition-all ${
                    emoji === em
                      ? 'bg-cyan-950 border-cyan-500 scale-110 shadow-md shadow-cyan-950/50'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Handle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase tracking-wider block">
                2. {isAm ? "ሙሉ ስም (Name)" : "Full Name"} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera or Meron T."
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500  px-3.5 py-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase tracking-wider block">
                3. {isAm ? "የኮድ መጠሪያ (Handle)" : "Dev Handle"}
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="e.g. @alex_codes"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500  px-3.5 py-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Gender & Looking For Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase tracking-wider block">
                4. {isAm ? "እርስዎ ማን ኖት? (I Am)" : "I Am"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setGender('female');
                    if (emoji === '👨‍💻') setEmoji('👩‍💻');
                  }}
                  className={`p-2.5  border text-center transition-all ${
                    gender === 'female'
                      ? 'bg-fuchsia-950 border-fuchsia-500 text-fuchsia-200 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  👩‍💻 {isAm ? "ሴት ገንቢ" : "Female Dev"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGender('male');
                    if (emoji === '👩‍💻') setEmoji('👨‍💻');
                  }}
                  className={`p-2.5  border text-center transition-all ${
                    gender === 'male'
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-200 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  👨‍💻 {isAm ? "ወንድ ገንቢ" : "Male Dev"}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase tracking-wider block">
                5. {isAm ? "የሚፈልጉት? (Looking For)" : "Looking For"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLookingFor('female')}
                  className={`p-2.5  border text-center transition-all ${
                    lookingFor === 'female'
                      ? 'bg-fuchsia-950 border-fuchsia-500 text-fuchsia-200 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  👩‍💻 {isAm ? "የሴት ጓደኛ" : "Girlfriend"}
                </button>
                <button
                  type="button"
                  onClick={() => setLookingFor('male')}
                  className={`p-2.5  border text-center transition-all ${
                    lookingFor === 'male'
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-200 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  👨‍💻 {isAm ? "የወንድ ጓደኛ" : "Boyfriend"}
                </button>
              </div>
            </div>
          </div>

          {/* Location & Coding Habits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-slate-300 font-bold uppercase tracking-wider block">
                6. {isAm ? "መገኛ (Location)" : "Location"}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Addis Ababa 🇪🇹"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500  px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase tracking-wider block">
                7. Indentation
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {['Tabs', 'Spaces'].map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => setIndentation(ind)}
                    className={`py-2  border text-center transition-all ${
                      indentation === ind
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-bold uppercase tracking-wider block">
                8. Fuel / Drink
              </label>
              <select
                value={drink}
                onChange={(e) => setDrink(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500  px-2.5 py-2 text-slate-200 focus:outline-none"
              >
                <option value="☕ Ethiopian Bunna">☕ Ethiopian Bunna</option>
                <option value="🧊 Cold Brew">🧊 Cold Brew</option>
                <option value="🍵 Matcha Tea">🍵 Matcha Tea</option>
                <option value="🫖 Earl Grey">🫖 Earl Grey</option>
              </select>
            </div>
          </div>

          {/* Primary Tech Stack Tags */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold uppercase tracking-wider block">
                9. {isAm ? "የኮዲንግ ቴክኖሎጂዎች (Tech Stack — 1 to 5)" : "Primary Tech Stack (Select 1-5)"}
              </label>
              <span className="text-slate-500 text-[10px]">{techStack.length}/5 selected</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_STACKS.map((tech) => {
                const isSelected = techStack.includes(tech);
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggleTech(tech)}
                    className={`px-3 py-1.5  border text-xs transition-all ${
                      isSelected
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-200 font-bold shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isSelected && <span className="mr-1">✓</span>}
                    {tech}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tell Me About Yourself (Bio) */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-bold uppercase tracking-wider block">
              10. {isAm ? "ስለ እርስዎ ይንገሩን (Tell Me About Yourself)" : "Tell Me About Yourself (Bio)"} *
            </label>
            <textarea
              rows={3}
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={
                isAm
                  ? "ለምሳሌ: ማታ ማታ React ላይ ኮድ ማድረግ ደስ ይለኛል፣ ቡና አፍቃሪ ነኝ፣ ጥሩ ውይይት ከሚወድ ሰው ጋር መገናኘት እፈልጋለሁ..."
                  : "e.g. Late night frontend developer, addicted to pour-over coffee, looking for someone who gets excited about clean code and deep late night talks..."
              }
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500  p-3 text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors leading-relaxed resize-none"
            />
          </div>

          {/* Success Message Banner */}
          {successMsg && (
            <div className="p-3.5  bg-emerald-950/80 border border-emerald-600 text-emerald-300 font-bold text-xs animate-bounce-in flex items-center gap-2">
              <span className="text-lg">🎉</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!name.trim() || isSaving}
              className={`w-full py-3.5  font-bold transition-all shadow-xl flex items-center justify-center gap-2 text-sm ${
                isSaving
                  ? 'bg-slate-800 text-slate-400 cursor-wait'
                  : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-fuchsia-600 hover:opacity-95 text-white cursor-pointer'
              }`}
            >
              <span>{isSaving ? '⏳' : '🚀'}</span>
              <span>
                {isSaving
                  ? (isAm ? 'ዳታቤዝ ውስጥ እየተመዘገበ ነው...' : 'Saving to Database...')
                  : (isAm ? 'ካርዴን መዝግብ እና መፈለግ ጀምር' : 'Save to Database & Start Chatting')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
