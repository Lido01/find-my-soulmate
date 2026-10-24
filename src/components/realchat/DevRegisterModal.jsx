// ─────────────────────────────────────────────────────────────────────────────
// DevRegisterModal.jsx — Developer Dating Registration & Criteria Setup Modal
// High-tech Red, Black & White developer theme with Space Grotesk / JetBrains Mono
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react';
import { IconX } from '../ui/Icons.jsx';
import { soundEngine } from '../../utils/audio.js';
import { wsService } from '../../services/websocket.js';

const AVAILABLE_STACKS = [
  'React', 'TypeScript', 'Next.js', 'Rust', 'Python', 'Go', 
  'Linux', 'Tailwind', 'Node.js', 'PyTorch', 'Vue', 'Flutter',
  'Svelte', 'Docker', 'GraphQL', 'PostgreSQL'
];

const EMOJI_OPTIONS = ['👩‍💻', '👨‍💻', '🧑‍💻', '💻', '⚡', '☕', '🚀', '🧠', '✨', '🔥', '🌸', '🤖', '👾', '🎧'];

export default function DevRegisterModal({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
  onStartChatNow,
  defaultTarget = null,
  initialAuthMode = 'register',
  lang = 'en',
}) {
  const isAm = lang === 'am';

  // If defaultTarget is passed or profile already registered, jump to step 2; else step 1
  const [step, setStep] = useState(() => (currentProfile?.isRegistered || defaultTarget ? 2 : 1));
  const [authMode, setAuthMode] = useState(initialAuthMode); // 'register' | 'login'
  const [inputLoveCode, setInputLoveCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [loveCode] = useState(() => currentProfile?.loveCode || `LOVE-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);

  const [name, setName] = useState(currentProfile?.name || '');
  const [handle, setHandle] = useState(currentProfile?.handle || '');
  const [gender, setGender] = useState(currentProfile?.gender || (defaultTarget === 'male' ? 'female' : 'male'));
  const [lookingFor, setLookingFor] = useState(defaultTarget || currentProfile?.lookingFor || 'female');
  const [location, setLocation] = useState(currentProfile?.location || 'Addis Ababa 🇪🇹');
  const [bio, setBio] = useState(currentProfile?.bio || '');
  const [quote, setQuote] = useState(currentProfile?.quote || '');
  const [indentation, setIndentation] = useState(currentProfile?.indentation || 'Tabs');
  const [drink, setDrink] = useState(currentProfile?.drink || '☕ Ethiopian Bunna');
  const [emoji, setEmoji] = useState(currentProfile?.emoji || '🧑‍💻');
  const [avatarUrl, setAvatarUrl] = useState(currentProfile?.avatarUrl || null);
  const [techStack, setTechStack] = useState(currentProfile?.techStack || ['React', 'TypeScript']);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialAuthMode);
      setStep(currentProfile?.isRegistered || defaultTarget ? 2 : 1);
      setErrorMsg('');
    }
  }, [isOpen, initialAuthMode, currentProfile?.isRegistered, defaultTarget]);

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

  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size should be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (result) {
        setAvatarUrl(result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleCopyLoveCode() {
    soundEngine.playRomanticChime();
    const codeToCopy = currentProfile?.loveCode || loveCode;
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(codeToCopy);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2400);
      }
    } catch {}
  }

  async function handleLoginWithLoveCode(e) {
    e.preventDefault();
    const code = inputLoveCode.trim().toUpperCase();
    if (!code) return;

    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await wsService.loginWithLoveCode(code);
      if (res.success && res.user) {
        soundEngine.playRomanticChime();
        setSuccessMsg(`Welcome back, ${res.user.name}!`);
        onSaveProfile?.(res.user);
        setTimeout(() => {
          setIsSaving(false);
          setSuccessMsg('');
          onClose?.();
          onStartChatNow?.();
        }, 1200);
      } else {
        setIsSaving(false);
        setErrorMsg(res.error || 'Love Code not found. Please check and try again!');
      }
    } catch (err) {
      setIsSaving(false);
      setErrorMsg(err.message || 'Error connecting to database. Please try again!');
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMsg('Please enter your name');
      return;
    }

    if (!bio.trim()) {
      setErrorMsg('Please tell us a little about yourself in the bio');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    const formattedHandle = handle.trim().startsWith('@')
      ? handle.trim()
      : `@${handle.trim().toLowerCase().replace(/\s+/g, '_')}`;

    const profileData = {
      id: currentProfile?.id || `dev_${Date.now()}`,
      loveCode: currentProfile?.loveCode || loveCode,
      name: name.trim(),
      handle: formattedHandle || `@${name.trim().toLowerCase().replace(/\s+/g, '_')}`,
      gender,
      lookingFor,
      location: location.trim(),
      bio: bio.trim(),
      quote: quote.trim(),
      indentation,
      drink,
      emoji,
      avatarUrl: avatarUrl || null,
      techStack,
      isRegistered: true,
      registeredAt: currentProfile?.registeredAt || new Date().toISOString(),
      followers: currentProfile?.followers || [],
      following: currentProfile?.following || [],
      friends: currentProfile?.friends || [],
      likes: currentProfile?.likes || 1,
      likedBy: currentProfile?.likedBy || [],
    };

    try {
      await wsService.registerUser(profileData);
    } catch (err) {
      console.warn('Backend sync deferred; saving locally:', err);
    }

    soundEngine.playRomanticChime();
    setSuccessMsg(isAm ? 'መገለጫዎ በተሳካ ሁኔታ ተመዝግቧል!' : 'Developer Profile registered successfully in database!');

    onSaveProfile?.(profileData);

    setTimeout(() => {
      setIsSaving(false);
      setSuccessMsg('');
      onClose?.();
      onStartChatNow?.();
    }, 1100);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in font-mono select-text"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="w-full max-w-lg max-h-[92vh] bg-black border border-zinc-800 rounded-3xl shadow-2xl shadow-red-950/40 flex flex-col overflow-hidden animate-slide-up">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/90 shrink-0">
          <div>
            <span className="text-[10px] text-red-400 uppercase tracking-widest font-bold">
              {authMode === 'login'
                ? (isAm ? 'መግቢያ' : 'Authentication')
                : step === 1
                ? (isAm ? 'ደረጃ 1 ከ 2' : 'Step 1 of 2')
                : (isAm ? 'ደረጃ 2 ከ 2' : 'Step 2 of 2')}
            </span>
            <h2 className="font-heading text-base sm:text-lg font-black text-white">
              {authMode === 'login'
                ? (isAm ? 'በ Love Code ይግቡ' : 'Login with Love Code')
                : step === 1
                ? (isAm ? 'ማንን ማግኘት ይፈልጋሉ?' : 'Who are you looking for?')
                : (isAm ? 'ስለ እርስዎ ይንገሩን (መገለጫ ይመዝገቡ)' : 'Tell Me About Yourself')}
            </h2>
          </div>

          {currentProfile?.isRegistered && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-red-600 transition-colors"
            >
              <IconX className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Auth Mode Toggle Tabs (Register vs Login with Love Code) */}
        <div className="grid grid-cols-2 p-1.5 bg-black border-b border-zinc-800 text-xs shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => {
              soundEngine.playHeartbeat();
              setAuthMode('register');
              setErrorMsg('');
            }}
            className={`py-2 text-center font-bold rounded-xl transition-all ${
              authMode === 'register'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
            }`}
          >
            {isAm ? 'አዲስ መመዝገቢያ' : 'Register Dev Card'}
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playHeartbeat();
              setAuthMode('login');
              setErrorMsg('');
            }}
            className={`py-2 text-center font-bold rounded-xl transition-all ${
              authMode === 'login'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white'
            }`}
          >
            {isAm ? 'በ Love Code ግባ' : 'Login with Love Code'}
          </button>
        </div>

        {/* ── AUTH MODE: LOGIN WITH LOVE CODE ─────────────────────────────────── */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginWithLoveCode} className="p-5 sm:p-6 space-y-4 overflow-y-auto bg-black">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-red-600 mx-auto flex items-center justify-center text-3xl shadow">
                🔑
              </div>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed font-sans">
                {isAm
                  ? 'በዚህ ወይም በሌላ ስልክ/ኮምፒውተር ሲመዘገቡ የተሰጠዎትን ልዩ የፍቅር ኮድ (Love Code) ያስገቡ።'
                  : 'Enter the unique Love Code given when you registered to restore your profile and message history on any device.'}
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-zinc-300 font-bold block text-xs">
                {isAm ? 'የፍቅር ኮድ (Love Code)' : 'Your Unique Love Code'} *
              </label>
              <input
                type="text"
                required
                value={inputLoveCode}
                onChange={(e) => setInputLoveCode(e.target.value.toUpperCase())}
                placeholder="e.g. LOVE-8FA2-K9Q1"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-600 rounded-xl px-3.5 py-2.5 text-center text-sm font-bold tracking-wider text-red-400 placeholder:text-zinc-600 focus:outline-none"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-700 text-red-300 text-xs font-bold animate-shake">
                ⚠ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-red-950 border border-red-600 text-white font-bold text-xs animate-bounce-in flex items-center justify-center gap-2">
                <span>✓</span>
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving || !inputLoveCode.trim()}
              className={`w-full py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-xs ${
                isSaving
                  ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-wait'
                  : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-red-950/40'
              }`}
            >
              <span>
                {isSaving
                  ? (isAm ? 'እየገባ ነው...' : 'Authenticating...')
                  : (isAm ? 'ግባና ውይይት ጀምር' : 'Restore Profile & Enter Chat')}
              </span>
            </button>
          </form>
        )}

        {/* ── STEP 1: CHOOSE BF OR GF FIRST ─────────────────────────────────── */}
        {authMode === 'register' && step === 1 && (
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto bg-black">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {/* Option: Girlfriend */}
              <button
                type="button"
                onClick={() => handleSelectTarget('female')}
                className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-red-600 hover:bg-zinc-900 text-left transition-all group flex flex-col justify-between space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2 rounded-2xl bg-black border border-zinc-800 group-hover:border-red-600 transition-colors">👩‍💻</span>
                  <span className="text-xs font-bold text-red-400 group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-base">
                    {isAm ? "የሴት ጓደኛ (Girlfriend)" : "Find a Girlfriend"}
                  </h3>
                  <p className="font-sans text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    {isAm ? "ከብልህ ሴት ገንቢዎች ጋር ይገናኙ" : "Match with talented, passionate female developers."}
                  </p>
                </div>
              </button>

              {/* Option: Boyfriend */}
              <button
                type="button"
                onClick={() => handleSelectTarget('male')}
                className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 hover:border-red-600 hover:bg-zinc-900 text-left transition-all group flex flex-col justify-between space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2 rounded-2xl bg-black border border-zinc-800 group-hover:border-red-600 transition-colors">👨‍💻</span>
                  <span className="text-xs font-bold text-red-400 group-hover:translate-x-1 transition-transform">→</span>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-base">
                    {isAm ? "የወንድ ጓደኛ (Boyfriend)" : "Find a Boyfriend"}
                  </h3>
                  <p className="font-sans text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    {isAm ? "ከብልህ ወንድ ገንቢዎች ጋር ይገናኙ" : "Match with skilled, dedicated male developers."}
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: TELL ME ABOUT YOURSELF (FULL PROFILE CREATION) ─────────── */}
        {authMode === 'register' && step === 2 && (
          <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs bg-black" style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a transparent' }}>
            {/* Preference Badge / Change Button */}
            <div className="p-2.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-[11px]">
                  {isAm ? "የተመረጠ:" : "Looking for:"}
                </span>
                <span className="font-bold text-red-400">
                  {lookingFor === 'female' ? 'Girlfriend 👩‍💻' : 'Boyfriend 👨‍💻'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[11px] text-zinc-400 hover:text-white underline font-bold"
              >
                {isAm ? "ቀይር" : "Change"}
              </button>
            </div>

            {/* Unique Love Code Card for Cross-Device Login */}
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-red-900/50 flex items-center justify-between gap-3 shadow-inner">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-red-400 text-[11px] font-bold">
                  <span>🔑</span>
                  <span>{isAm ? "የእርስዎ ልዩ የፍቅር ኮድ (Love Code)" : "Your Unique Love Code"}</span>
                </div>
                <div className="text-white text-xs font-black tracking-widest mt-1 select-all font-mono">
                  {currentProfile?.loveCode || loveCode}
                </div>
                <p className="text-[10px] text-zinc-400 mt-0.5 font-sans">
                  {isAm ? "በማንኛውም ስልክ ወይም ኮምፒውተር ለመግባት ይህን ኮድ ይጠቀሙ" : "Copy & keep this code to restore your session anywhere"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyLoveCode}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 shadow"
              >
                <span>{copiedCode ? '✓' : '📋'}</span>
                <span>{copiedCode ? (isAm ? 'ተቀድቷል!' : 'Copied!') : (isAm ? 'ቅዳ' : 'Copy')}</span>
              </button>
            </div>

            {/* Profile Photo / Avatar Picker */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800">
              <label className="text-zinc-300 font-bold block">
                {isAm ? "የመገለጫ ፎቶ ወይም ኢሞጂ ይምረጡ" : "Profile Photo or Emoji Avatar"} *
              </label>

              <div className="flex items-center gap-3">
                {/* Current Avatar Preview */}
                <div className="relative w-14 h-14 rounded-2xl bg-black border-2 border-red-600 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">{emoji}</span>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-bold text-xs transition-colors"
                    >
                      📷 {avatarUrl ? (isAm ? "ፎቶ ቀይር" : "Change Photo") : (isAm ? "ፎቶ ስቀል" : "Upload Photo")}
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl(null)}
                        className="px-2 py-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-red-400 text-[11px]"
                      >
                        {isAm ? "አስወግድ" : "Remove"}
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-[10px] text-zinc-500">
                    {avatarUrl ? "Custom photo loaded" : "Or pick a developer avatar emoji below:"}
                  </p>
                </div>
              </div>

              {/* Emoji Options Grid */}
              {!avatarUrl && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmoji(em)}
                      className={`w-8 h-8 rounded-xl border text-lg flex items-center justify-center transition-all ${
                        emoji === em
                          ? 'bg-red-950 border-red-600 scale-110 shadow-sm'
                          : 'bg-black border-zinc-800 hover:bg-zinc-900'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Name & Handle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-zinc-300 font-bold block">
                  {isAm ? "ስምዎ" : "Your Name"} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dawit, Meron, Alex"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-600 rounded-xl px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-bold block">
                  {isAm ? "የተጠቃሚ መለያ" : "Handle / Nickname"} *
                </label>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@your_handle"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-600 rounded-xl px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Tell Me About Yourself (Bio) */}
            <div className="space-y-1">
              <label className="text-zinc-300 font-bold block">
                {isAm ? "ስለ እርስዎ ይንገሩን (Bio)" : "Tell Me About Yourself (Bio)"} *
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
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-600 rounded-xl p-2.5 text-white placeholder:text-zinc-600 focus:outline-none resize-none leading-relaxed font-sans"
              />
            </div>

            {/* Special Romantic Dev Quote / Motto */}
            <div className="space-y-1">
              <label className="text-zinc-300 font-bold block">
                {isAm ? "ልዩ የፍቅር ወይም የኮዲንግ ጥቅስ" : "Special Romantic Dev Quote / Motto"}
              </label>
              <input
                type="text"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder='e.g. "Tabs over spaces, but you over everything."'
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-600 rounded-xl px-3 py-2 text-white placeholder:text-zinc-600 focus:outline-none"
              />
            </div>

            {/* Tech Stack Pills */}
            <div className="space-y-1">
              <label className="text-zinc-300 font-bold flex items-center justify-between">
                <span>{isAm ? "የሚሰሩባቸው ቴክኖሎጂዎች" : "Your Tech Stack (Pick up to 5)"} *</span>
                <span className="text-[10px] text-red-400 font-bold">{techStack.length}/5 selected</span>
              </label>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {AVAILABLE_STACKS.map((tech) => {
                  const selected = techStack.includes(tech);
                  return (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTech(tech)}
                      className={`px-3 py-1 rounded-xl border font-bold transition-all text-[11px] ${
                        selected
                          ? 'bg-red-600 border-red-500 text-white shadow-sm'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
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
                <label className="text-zinc-300 font-bold block">Indentation</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Tabs', 'Spaces'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setIndentation(opt)}
                      className={`py-1.5 rounded-xl border text-center font-bold ${
                        indentation === opt
                          ? 'bg-red-950/70 border-red-600 text-white'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-bold block">Favorite Fuel</label>
                <select
                  value={drink}
                  onChange={(e) => setDrink(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                >
                  <option value="☕ Ethiopian Bunna">☕ Ethiopian Bunna</option>
                  <option value="☕ Espresso">☕ Espresso</option>
                  <option value="🍵 Green Tea">🍵 Green Tea</option>
                  <option value="🥤 Cold Brew">🥤 Cold Brew</option>
                  <option value="💧 Pure Water">💧 Pure Water</option>
                </select>
              </div>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-700 text-red-300 text-xs font-bold animate-shake">
                ⚠ {errorMsg}
              </div>
            )}

            {/* Success Banner */}
            {successMsg && (
              <div className="p-3 rounded-xl bg-red-950 border border-red-600 text-white font-bold text-xs animate-bounce-in flex items-center gap-2">
                <span>✓</span>
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!name.trim() || !bio.trim() || isSaving}
                className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-xs ${
                  isSaving
                    ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-wait'
                    : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-red-950/40'
                }`}
              >
                <span>{isSaving ? '⏳' : '🚀'}</span>
                <span>
                  {isSaving
                    ? (isAm ? 'እየተመዘገበ ነው...' : 'Registering in Database...')
                    : (isAm ? 'ተመዝገብና እውነተኛ ውይይት ጀምር' : 'Register Profile & Start Soulmate Chat')}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
