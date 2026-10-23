// ─────────────────────────────────────────────────────────────────────────────
// DevRegisterModal.jsx — Developer Dating Registration & Criteria Setup Modal
// Step 1: Choose Girlfriend or Boyfriend first
// Step 2: "Tell Me About Yourself", Profile Photo/Emoji & Special Quote setup
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react';
import { IconX, IconCheck, IconZap } from '../ui/Icons.jsx';
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
  lang = 'en',
}) {
  const isAm = lang === 'am';

  // If defaultTarget is passed or profile already registered, jump to step 2; else step 1
  const [step, setStep] = useState(() => (currentProfile?.isRegistered || defaultTarget ? 2 : 1));
  const [authMode, setAuthMode] = useState('register'); // 'register' | 'login'
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

  // Handle image upload from device
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
        setErrorMsg('');
        soundEngine.playRomanticChime();
      }
    };
    reader.readAsDataURL(file);
  }

  function handleCopyLoveCode() {
    try {
      navigator.clipboard?.writeText(currentProfile?.loveCode || loveCode);
      setCopiedCode(true);
      soundEngine.playRomanticChime();
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {}
  }

  async function handleLoginWithLoveCode(e) {
    e.preventDefault();
    if (!inputLoveCode.trim()) {
      setErrorMsg(isAm ? 'እባክዎ የፍቅር ኮድዎን (Love Code) ያስገቡ' : 'Please enter your Love Code');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    soundEngine.playHeartbeat();

    const res = await wsService.loginWithLoveCode(inputLoveCode.trim());
    setIsSaving(false);

    if (res.ok && res.user) {
      soundEngine.playGiftFanfare();
      onSaveProfile?.(res.user);
      setSuccessMsg(isAm ? `እንኳን ደህና መጡ ${res.user.name}! 🎉` : `Welcome back, ${res.user.name}! 💖`);
      setTimeout(() => {
        onClose?.();
        onStartChatNow?.();
      }, 1000);
    } else {
      setErrorMsg(res.error || (isAm ? 'የተሳሳተ ኮድ ነው። እባክዎ እንደገና ይሞክሩ!' : 'Invalid Love Code. Please check and try again!'));
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(isAm ? 'እባክዎ ስምዎን ያስገቡ' : 'Please provide your name');
      return;
    }
    if (!bio.trim()) {
      setErrorMsg(isAm ? 'እባክዎ ስለ እርስዎ አጭር መግለጫ ያስገቡ' : 'Please provide your bio');
      return;
    }
    if (techStack.length === 0) {
      setErrorMsg(isAm ? 'እባክዎ ቢያንስ 1 የቴክኖሎጂ ስብስብ ይምረጡ' : 'Please select at least 1 tech stack');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    soundEngine.playHeartbeat();

    const cleanName = name.trim();
    const finalHandle = handle.trim().startsWith('@')
      ? handle.trim()
      : `@${handle.trim() || cleanName.toLowerCase().replace(/\s+/g, '_')}`;

    const profileData = {
      id: currentProfile?.id || `dev_${Date.now()}`,
      name: cleanName,
      handle: finalHandle,
      gender,
      lookingFor,
      location: location.trim() || 'Addis Ababa 🇪🇹',
      bio: bio.trim(),
      quote: quote.trim() || (isAm ? 'ኮድ ከነፍስ ጋር ሲዋሃድ ፍቅር ይፈጠራል።' : 'Tabs over spaces, but you over everything.'),
      indentation,
      drink,
      emoji: avatarUrl ? '🧑‍💻' : emoji,
      avatarUrl: avatarUrl || null,
      techStack,
      loveCode: currentProfile?.loveCode || loveCode,
      isRegistered: true,
      registeredAt: currentProfile?.registeredAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to backend database & WebSocket
    await wsService.registerInBackend(profileData);
    onSaveProfile?.(profileData);

    soundEngine.playGiftFanfare();
    setSuccessMsg(
      isAm
        ? "🎉 በተሳካ ሁኔታ ተመዝግቧል! አሁን መፈለግ ጀምረዋል..."
        : "🎉 Profile registered! Launching real developer matchmaking..."
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in font-mono"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="w-full max-w-lg max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div>
            <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">
              {authMode === 'login'
                ? (isAm ? 'መግቢያ' : 'Authentication')
                : step === 1
                ? (isAm ? 'ደረጃ 1 ከ 2' : 'Step 1 of 2')
                : (isAm ? 'ደረጃ 2 ከ 2' : 'Step 2 of 2')}
            </span>
            <h2 className="text-base sm:text-lg font-black text-white">
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
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <IconX className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Auth Mode Toggle Tabs (Register vs Login with Love Code) */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-950 border-b border-slate-800 text-xs shrink-0 gap-1">
          <button
            type="button"
            onClick={() => {
              soundEngine.playHeartbeat();
              setAuthMode('register');
              setErrorMsg('');
            }}
            className={`py-2 text-center font-bold rounded-xl transition-all ${
              authMode === 'register'
                ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-600/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAm ? '📝 አዲስ መመዝገቢያ' : '📝 Register New Dev Card'}
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
                ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-600/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isAm ? '🔑 በ Love Code ግባ' : '🔑 Login with Love Code'}
          </button>
        </div>

        {/* ── AUTH MODE: LOGIN WITH LOVE CODE ─────────────────────────────────── */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginWithLoveCode} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
            <div className="text-center space-y-1.5">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/50 mx-auto flex items-center justify-center text-3xl shadow">
                🔑
              </div>
              <h3 className="text-white font-bold text-sm">
                {isAm ? 'በ Love Codeዎ ወደ መለያዎ ይመለሱ' : 'Login with your Love Code'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                {isAm
                  ? 'በዚህ ወይም በሌላ ስልክ/ኮምፒውተር ሲመዘገቡ የተሰጠዎትን ልዩ የፍቅር ኮድ (Love Code) ያስገቡ።'
                  : 'Enter the unique Love Code given when you registered to restore your profile and message history on any device.'}
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-slate-300 font-bold block text-xs">
                {isAm ? 'የፍቅር ኮድ (Love Code)' : 'Your Unique Love Code'} *
              </label>
              <input
                type="text"
                required
                value={inputLoveCode}
                onChange={(e) => setInputLoveCode(e.target.value.toUpperCase())}
                placeholder="e.g. LOVE-8FA2-K9Q1"
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-center text-sm font-bold tracking-wider text-cyan-300 placeholder:text-slate-600 focus:outline-none"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-700 text-red-300 text-xs font-bold animate-shake">
                ⚠ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-300 font-bold text-xs animate-bounce-in flex items-center justify-center gap-2">
                <span>✓</span>
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving || !inputLoveCode.trim()}
              className={`w-full py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-xs ${
                isSaving
                  ? 'bg-slate-800 text-slate-400 cursor-wait'
                  : 'bg-cyan-950 hover:bg-cyan-900 border border-cyan-600 text-cyan-200 cursor-pointer'
              }`}
            >
              <span>{isSaving ? '⏳' : '🔑'}</span>
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
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
            <p className="text-xs text-slate-400 text-center max-w-sm mx-auto">
              {isAm
                ? "በመጀመሪያ የሚፈልጉትን ይምረጡ፤ በመቀጠል ስለ እርስዎ ሙሉ መገለጫ ሞልተው እውነተኛ ውይይት ይጀምራሉ።"
                : "Choose who you want to meet first, then register your profile and photo to start real chatting."}
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

        {/* ── STEP 2: TELL ME ABOUT YOURSELF (FULL PROFILE CREATION) ─────────── */}
        {authMode === 'register' && step === 2 && (
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

            {/* Unique Love Code Card for Cross-Device Login */}
            <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-between gap-3 shadow-inner">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-cyan-300 text-[11px] font-bold">
                  <span>🔑</span>
                  <span>{isAm ? "የእርስዎ ልዩ የፍቅር ኮድ (Love Code)" : "Your Unique Love Code"}</span>
                </div>
                <div className="text-white text-xs font-black tracking-widest mt-1 select-all font-mono">
                  {currentProfile?.loveCode || loveCode}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isAm ? "በማንኛውም ስልክ ወይም ኮምፒውተር ለመግባት ይህን ኮድ ይጠቀሙ" : "Copy & keep this code to restore your session anywhere"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyLoveCode}
                className="px-3 py-1.5 rounded-xl bg-cyan-900/60 hover:bg-cyan-800 border border-cyan-600/70 text-cyan-200 text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 shadow"
              >
                <span>{copiedCode ? '✓' : '📋'}</span>
                <span>{copiedCode ? (isAm ? 'ተቀድቷል!' : 'Copied!') : (isAm ? 'ቅዳ' : 'Copy')}</span>
              </button>
            </div>

            {/* Profile Photo / Avatar Picker */}
            <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
              <label className="text-slate-300 font-bold block">
                {isAm ? "የመገለጫ ፎቶ ወይም ኢሞጂ ይምረጡ" : "Profile Photo or Emoji Avatar"} *
              </label>

              <div className="flex items-center gap-3">
                {/* Current Avatar Preview */}
                <div className="relative w-14 h-14 rounded-2xl bg-slate-900 border-2 border-cyan-500 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
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
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold text-xs transition-colors"
                    >
                      📷 {avatarUrl ? (isAm ? "ፎቶ ቀይር" : "Change Photo") : (isAm ? "ፎቶ ስቀል" : "Upload Photo")}
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl(null)}
                        className="px-2 py-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-red-400 text-[11px]"
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
                  <p className="text-[10px] text-slate-500">
                    {avatarUrl ? "Custom photo loaded" : "Or pick a developer avatar emoji below:"}
                  </p>
                </div>
              </div>

              {/* Emoji Options Grid (If no photo or user wants to pick emoji) */}
              {!avatarUrl && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmoji(em)}
                      className={`w-8 h-8 rounded-lg border text-lg flex items-center justify-center transition-all ${
                        emoji === em
                          ? 'bg-cyan-950 border-cyan-500 scale-110 shadow-sm'
                          : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
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
                  {isAm ? "የተጠቃሚ መለያ" : "Handle / Nickname"} *
                </label>
                <input
                  type="text"
                  required
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
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Special Romantic Dev Quote / Motto */}
            <div className="space-y-1">
              <label className="text-slate-300 font-bold block">
                {isAm ? "ልዩ የፍቅር ወይም የኮዲንግ ጥቅስ" : "Special Romantic Dev Quote / Motto"}
              </label>
              <input
                type="text"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder='e.g. "Tabs over spaces, but you over everything."'
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none"
              />
            </div>

            {/* Tech Stack Pills */}
            <div className="space-y-1">
              <label className="text-slate-300 font-bold flex items-center justify-between">
                <span>{isAm ? "የሚሰሩባቸው ቴክኖሎጂዎች" : "Your Tech Stack (Pick up to 5)"} *</span>
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
                  <option value="💧 Pure Water">💧 Pure Water</option>
                </select>
              </div>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-700 text-red-300 text-xs font-bold animate-shake">
                ⚠ {errorMsg}
              </div>
            )}

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
                disabled={!name.trim() || !bio.trim() || isSaving}
                className={`w-full py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-xs ${
                  isSaving
                    ? 'bg-slate-800 text-slate-400 cursor-wait'
                    : 'bg-cyan-950 hover:bg-cyan-900 border border-cyan-600 text-cyan-200 cursor-pointer'
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