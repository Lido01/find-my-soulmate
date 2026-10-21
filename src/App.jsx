// ─────────────────────────────────────────────────────────────────────────────
// App.jsx — Root application shell (Girlfriend/Boyfriend, Audio Voice, Profile Settings)
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback, useEffect } from 'react';
import { CHARACTERS, MOOD_META } from './data/characters.js';
import { useLang } from './context/LanguageContext.jsx';
import { useGameState } from './hooks/useGameState.js';
import {
  loadApiKey,
  saveApiKey,
  clearApiKey,
  loadUserProfile,
  saveUserProfile,
  loadAudioSettings,
  saveAudioSettings,
} from './utils/storage.js';
import { validateApiKey } from './utils/gemini.js';
import { soundEngine } from './utils/audio.js';

// Layout components
import HeaderBar from './components/layout/HeaderBar.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import FooterConsole from './components/layout/FooterConsole.jsx';

// Chat components
import ChatFeed from './components/chat/ChatFeed.jsx';
import RomanticLoveDrawer from './components/chat/RomanticLoveDrawer.jsx';

// Character components
import CharacterSelectScreen from './components/character/CharacterSelectScreen.jsx';

// Modal components
import GiftModal from './components/gifts/GiftModal.jsx';
import ApiKeyModal from './components/settings/ApiKeyModal.jsx';
import ProfileSettingsModal from './components/settings/ProfileSettingsModal.jsx';
import OnboardingModal from './components/onboarding/OnboardingModal.jsx';

// UI components
import MoodToast from './components/ui/MoodToast.jsx';
import LoveWordBubble from './components/ui/LoveWordBubble.jsx';

export default function App() {
  const { lang, t } = useLang();
  const [apiKey, setApiKeyState] = useState(() => loadApiKey());
  const [userProfile, setUserProfileState] = useState(() => loadUserProfile());
  const [audioSettings, setAudioSettingsState] = useState(() => loadAudioSettings());

  const [showApiModal, setShowApiModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loveDrawerOpen, setLoveDrawerOpen] = useState(false);

  const [moodToast, setMoodToast] = useState({ mood: null, visible: false });

  // Sync sound engine config on load
  useEffect(() => {
    soundEngine.enabled = audioSettings.soundEffects;
    soundEngine.voiceEnabled = audioSettings.voiceNarration;
    soundEngine.voiceVolume = audioSettings.volume;
  }, [audioSettings]);

  // Mood change callback with romantic chime
  const handleMoodChange = useCallback((mood) => {
    soundEngine.playHeartbeat();
    setMoodToast({ mood, visible: true });
    setTimeout(() => setMoodToast({ mood: null, visible: false }), 2800);
  }, []);

  // Game state hook
  const {
    gameState, isTyping, aiError, feedRef,
    activeCharacter, activeCharState, activeDialogue,
    phase,
    handleSelectCharacter, handleChoice, handleCustomMessage, handleGift,
    handleSwitchCharacter, handleBack, handleReset,
  } = useGameState({ apiKey, lang, onMoodChange: handleMoodChange });

  // API key management
  const handleApiKeySave = useCallback(async (key) => {
    if (!key) { clearApiKey(); setApiKeyState(''); return true; }
    const valid = await validateApiKey(key);
    if (valid) { saveApiKey(key); setApiKeyState(key); return true; }
    if (key.trim().startsWith('AIza')) {
      saveApiKey(key.trim());
      setApiKeyState(key.trim());
      return true;
    }
    return false;
  }, []);

  // User Profile save
  const handleSaveProfile = useCallback((newProfile) => {
    saveUserProfile(newProfile);
    setUserProfileState(newProfile);
  }, []);

  // Audio settings save
  const handleSaveAudioSettings = useCallback((newAudio) => {
    saveAudioSettings(newAudio);
    setAudioSettingsState(newAudio);
  }, []);

  const handleGiftSend = useCallback((gift) => {
    setShowGiftModal(false);
    soundEngine.playGiftFanfare();
    handleGift(gift, lang);
  }, [handleGift, lang]);

  const canGift = Boolean(activeCharState && (activeCharState.relationship ?? 0) >= 15);
  const aiModeActive = Boolean(apiKey);

  return (
    <div className="h-full flex flex-col bg-slate-950 font-mono overflow-hidden select-none">
      {/* Top header */}
      <HeaderBar
        phase={phase}
        activeCharacter={activeCharacter}
        charState={activeCharState}
        userProfile={userProfile}
        onReset={handleReset}
        onBack={handleBack}
        onApiKeyClick={() => setShowApiModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        apiKeySet={aiModeActive}
        t={t}
      />

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — chat phase only */}
        {phase === 'chat' && activeCharacter && activeCharState && (
          <Sidebar
            activeCharacter={activeCharacter}
            charState={activeCharState}
            allCharacters={CHARACTERS}
            allCharStates={gameState.characters}
            onSwitchCharacter={handleSwitchCharacter}
            t={t}
            lang={lang}
            aiModeActive={aiModeActive}
          />
        )}

        {/* Main panel */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {phase === 'select' ? (
            <CharacterSelectScreen
              allCharacters={CHARACTERS}
              allCharStates={gameState.characters}
              onSelect={handleSelectCharacter}
              userProfile={userProfile}
              onOpenOnboarding={() => setShowOnboarding(true)}
              t={t}
              lang={lang}
            />
          ) : (
            <>
              {/* Chat header bar */}
              {activeCharacter && activeCharState && (
                <ChatHeader
                  character={activeCharacter}
                  charState={activeCharState}
                  userProfile={userProfile}
                  onOpenLoveHub={() => setLoveDrawerOpen((prev) => !prev)}
                  t={t}
                  lang={lang}
                  aiModeActive={aiModeActive}
                />
              )}

              {/* AI Error banner */}
              {aiError && (
                <div className="flex-shrink-0 bg-amber-950/40 border-b border-amber-800/50 px-4 py-2 text-xs text-amber-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>⚠</span>
                    <span>{aiError}</span>
                  </div>
                  <button
                    onClick={() => setShowApiModal(true)}
                    className="underline hover:text-white"
                  >
                    Check API Key
                  </button>
                </div>
              )}

              {/* Chat feed */}
              {activeCharacter && (
                <ChatFeed
                  messages={activeCharState?.messages || []}
                  character={activeCharacter}
                  userProfile={userProfile}
                  isTyping={isTyping}
                  feedRef={feedRef}
                  lang={lang}
                />
              )}

              {/* Romantic Love Drawer */}
              {activeCharacter && activeCharState && (
                <RomanticLoveDrawer
                  isOpen={loveDrawerOpen}
                  onClose={() => setLoveDrawerOpen(false)}
                  charState={activeCharState}
                  character={activeCharacter}
                  onSendLoveMessage={handleCustomMessage}
                  lang={lang}
                />
              )}

              {/* Footer console */}
              {activeCharacter && activeCharState && (
                <FooterConsole
                  dialogue={activeDialogue}
                  character={activeCharacter}
                  charState={activeCharState}
                  onChoice={handleChoice}
                  onSendMessage={handleCustomMessage}
                  isTyping={isTyping}
                  t={t}
                  lang={lang}
                  onGiftClick={() => setShowGiftModal(true)}
                  canGift={canGift}
                  aiModeActive={aiModeActive}
                  onToggleLoveDrawer={() => setLoveDrawerOpen((prev) => !prev)}
                  loveDrawerOpen={loveDrawerOpen}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <GiftModal
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        onGift={handleGiftSend}
        character={activeCharacter}
        t={t}
        lang={lang}
      />
      <ApiKeyModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        onSave={handleApiKeySave}
        currentKey={apiKey}
        t={t}
      />
      <ProfileSettingsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        audioSettings={audioSettings}
        onSaveAudioSettings={handleSaveAudioSettings}
        onOpenOnboarding={() => setShowOnboarding(true)}
        lang={lang}
      />
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        lang={lang}
      />

      {/* Ambient overlays */}
      <MoodToast mood={moodToast.mood} visible={moodToast.visible} t={t} lang={lang} />
      <LoveWordBubble lang={lang} />
    </div>
  );
}

// ── Inline Chat Header ────────────────────────────────────────────────────────
function ChatHeader({ character, charState, userProfile, onOpenLoveHub, t, lang, aiModeActive }) {
  const mood = MOOD_META[charState.mood] || MOOD_META.curious;
  const borderColor = character?.borderColor || '#10b981';

  return (
    <div className="flex-shrink-0 flex items-center gap-3 px-5 py-2.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm">
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${character.avatarBg || 'from-slate-800 to-slate-950'} flex items-center justify-center text-sm font-black text-white border-2 flex-shrink-0 shadow`}
        style={{ borderColor: borderColor, boxShadow: `0 0 10px ${borderColor}50` }}
      >
        {character.avatarInitials}
      </div>

      {/* Name row */}
      <div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-black ${character.textClass || 'text-white'}`}>{character.name}</span>
          <span className="text-xs text-slate-500">{character.handle}</span>
          <span>{mood?.emoji}</span>
          <span className="text-[10px] text-fuchsia-300 border border-fuchsia-800/80 bg-fuchsia-950/60 rounded px-1.5 py-0.5">
            {character.gender === 'female' ? 'Girlfriend 👩‍💻' : 'Boyfriend 👨‍💻'}
          </span>
          {aiModeActive && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 font-bold">
              🤖 AI Mode
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-500">
            {t?.online ?? "online"} · {typeof character.title === 'object' ? character.title[lang] || character.title.en : character.title}
          </span>
        </div>
      </div>

      {/* Right stats */}
      <div className="ml-auto hidden sm:flex items-center gap-3">
        {/* Quick Love Hub Pill Button */}
        <button
          onClick={onOpenLoveHub}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 hover:border-fuchsia-500 transition-all text-xs font-mono"
          title="Open Love Metrics & Reactions"
        >
          <span>💖</span>
          <span className="text-slate-300 font-bold">{charState.relationship}%</span>
          <span className="text-slate-500 text-[10px]">Bond</span>
        </button>

        <div
          className={`px-3 py-1 rounded-xl text-xs font-bold border ${mood?.bgClass || 'bg-slate-900'} ${mood?.textClass || 'text-cyan-400'}`}
          style={{ borderColor: borderColor + '60' }}
        >
          {t?.moods?.[charState.mood] || charState.mood}
        </div>
      </div>
    </div>
  );
}
