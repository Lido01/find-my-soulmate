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
import { validateApiKey, cleanApiKey } from './utils/gemini.js';
import { soundEngine } from './utils/audio.js';

// Layout components
import HeaderBar from './components/layout/HeaderBar.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import FooterConsole from './components/layout/FooterConsole.jsx';
import MobileNavDrawer from './components/layout/MobileNavDrawer.jsx';

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
import AboutGuideModal from './components/guide/AboutGuideModal.jsx';
import DevRegisterModal from './components/realchat/DevRegisterModal.jsx';

// UI components
import MoodToast from './components/ui/MoodToast.jsx';
import LoveWordBubble from './components/ui/LoveWordBubble.jsx';

// Real-Time WebSocket Chat Components
import RealChatLobby from './components/realchat/RealChatLobby.jsx';
import RealChatRoom from './components/realchat/RealChatRoom.jsx';
import RealPeerSidebar from './components/realchat/RealPeerSidebar.jsx';
import { wsService } from './services/websocket.js';

export default function App() {
  const { lang, t } = useLang();
  const [apiKey, setApiKeyState] = useState(() => loadApiKey());
  const [userProfile, setUserProfileState] = useState(() => loadUserProfile());
  const [audioSettings, setAudioSettingsState] = useState(() => loadAudioSettings());

  const [showApiModal, setShowApiModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showDevRegisterModal, setShowDevRegisterModal] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [loveDrawerOpen, setLoveDrawerOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Mode switcher: 'virtual' (AI Soulmates) vs 'real_ws' (Live WebSocket Real Users)
  const [chatMode, setChatMode] = useState('virtual');
  const [activeRealPeer, setActiveRealPeer] = useState(null);
  const [onlinePeers, setOnlinePeers] = useState([]);

  // Listen for room entry and presence from WebSocket service
  useEffect(() => {
    const unbindRoom = wsService.on('room:entered', ({ peer }) => {
      setActiveRealPeer(peer);
      setChatMode('real_ws');
    });

    const unbindPresence = wsService.on('presence:update', (data) => {
      setOnlinePeers(data.users || []);
    });

    return () => {
      unbindRoom();
      unbindPresence();
    };
  }, []);

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
  const handleApiKeySave = useCallback((key) => {
    const cleaned = cleanApiKey(key);
    if (!cleaned) {
      clearApiKey();
      setApiKeyState('');
      return true;
    }
    saveApiKey(cleaned);
    setApiKeyState(cleaned);
    return true;
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
    <div className="h-[100dvh] min-h-[100dvh] w-full flex flex-col bg-slate-950 font-mono overflow-hidden select-text">
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
        onOpenRegister={() => setShowDevRegisterModal(true)}
        onOpenAbout={() => setShowAboutModal(true)}
        onOpenMobileMenu={() => setShowMobileNav(true)}
        apiKeySet={aiModeActive}
        chatMode={chatMode}
        onToggleChatMode={(m) => {
          setChatMode(m);
          if (m === 'virtual') setActiveRealPeer(null);
        }}
        t={t}
      />

      {/* Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar — AI Chat Mode */}
        {chatMode === 'virtual' && phase === 'chat' && activeCharacter && activeCharState && (
          <div className="hidden md:flex shrink-0">
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
          </div>
        )}

        {/* Desktop Sidebar — Real WebSocket Peer Mode */}
        {chatMode === 'real_ws' && activeRealPeer && (
          <div className="hidden md:flex shrink-0">
            <RealPeerSidebar
              peer={activeRealPeer}
              userProfile={userProfile}
              allOnlinePeers={onlinePeers}
              onSwitchPeer={(newPeer) => setActiveRealPeer(newPeer)}
              onWave={(p) => wsService.sendSocialAction('wave', p.id)}
              onLike={(p) => wsService.sendSocialAction('like', p.id)}
              onAddFriend={(p) => wsService.sendSocialAction('add_friend', p.id)}
              lang={lang}
            />
          </div>
        )}

        {/* Mobile Sidebar Overlay Drawer */}
        {phase === 'chat' && activeCharacter && activeCharState && mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden bg-black/70 backdrop-blur-sm flex animate-fade-in"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <div
              className="w-72 h-full bg-slate-950 border-r border-slate-800 shadow-2xl flex flex-col animate-slide-right"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/90">
                <span className="font-mono text-xs font-bold text-slate-300">// Partner Stats & Switch</span>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="px-2 py-1  text-slate-400 hover:text-white bg-slate-800 text-xs font-mono"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar
                  activeCharacter={activeCharacter}
                  charState={activeCharState}
                  allCharacters={CHARACTERS}
                  allCharStates={gameState.characters}
                  onSwitchCharacter={(id) => {
                    handleSwitchCharacter(id);
                    setMobileSidebarOpen(false);
                  }}
                  t={t}
                  lang={lang}
                  aiModeActive={aiModeActive}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main panel */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950 min-w-0">
          {chatMode === 'real_ws' ? (
            activeRealPeer ? (
              <RealChatRoom
                peer={activeRealPeer}
                userProfile={userProfile}
                allOnlinePeers={onlinePeers}
                onSwitchPeer={(p) => setActiveRealPeer(p)}
                onLeave={() => setActiveRealPeer(null)}
                lang={lang}
              />
            ) : (
              <RealChatLobby
                userProfile={userProfile}
                onOpenProfile={() => setShowProfileModal(true)}
                onOpenRegister={() => setShowDevRegisterModal(true)}
                onBackToModeSelect={() => setChatMode('virtual')}
                lang={lang}
              />
            )
          ) : phase === 'select' ? (
            <CharacterSelectScreen
              allCharacters={CHARACTERS}
              allCharStates={gameState.characters}
              onSelect={handleSelectCharacter}
              userProfile={userProfile}
              onOpenOnboarding={() => setShowOnboarding(true)}
              onOpenAbout={() => setShowAboutModal(true)}
              onSwitchToRealWs={() => setChatMode('real_ws')}
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
                  onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
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

      {/* Modals & Drawers */}
      <MobileNavDrawer
        isOpen={showMobileNav}
        onClose={() => setShowMobileNav(false)}
        chatMode={chatMode}
        onToggleChatMode={(m) => {
          setChatMode(m);
          if (m === 'virtual') setActiveRealPeer(null);
        }}
        userProfile={userProfile}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenRegister={() => setShowDevRegisterModal(true)}
        onOpenAbout={() => setShowAboutModal(true)}
        onOpenApiKey={() => setShowApiModal(true)}
        apiKeySet={aiModeActive}
        onReset={handleReset}
        lang={lang}
      />
      <DevRegisterModal
        isOpen={showDevRegisterModal}
        onClose={() => setShowDevRegisterModal(false)}
        currentProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        onStartChatNow={() => {
          setChatMode('real_ws');
          soundEngine.playRomanticChime();
        }}
        lang={lang}
      />
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
      <AboutGuideModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        onChooseCategory={(cat) => {
          handleBack();
        }}
        lang={lang}
      />

      {/* Ambient overlays */}
      <MoodToast mood={moodToast.mood} visible={moodToast.visible} t={t} lang={lang} />
      <LoveWordBubble lang={lang} />
    </div>
  );
}

// ── Inline Chat Header ────────────────────────────────────────────────────────
function ChatHeader({ character, charState, userProfile, onOpenLoveHub, onToggleMobileSidebar, t, lang, aiModeActive }) {
  const mood = MOOD_META[charState.mood] || MOOD_META.curious;
  const borderColor = character?.borderColor || '#10b981';

  return (
    <div className="flex-shrink-0 flex items-center gap-3 px-3 sm:px-5 py-2.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm">
      {/* Avatar */}
      <div
        className={`w-9 h-9  bg-gradient-to-br ${character.avatarBg || 'from-slate-800 to-slate-950'} flex items-center justify-center text-sm font-black text-white border-2 flex-shrink-0 shadow`}
        style={{ borderColor: borderColor, boxShadow: `0 0 10px ${borderColor}50` }}
      >
        {character.avatarInitials}
      </div>

      {/* Name row */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span className={`text-sm font-black truncate ${character.textClass || 'text-white'}`}>{character.name}</span>
          <span className="text-xs text-slate-500 hidden sm:inline">{character.handle}</span>
          <span>{mood?.emoji}</span>
          <span className="text-[10px] text-fuchsia-300 border border-fuchsia-800/80 bg-fuchsia-950/60 rounded px-1.5 py-0.5">
            {character.gender === 'female' ? 'Girlfriend 👩‍💻' : 'Boyfriend 👨‍💻'}
          </span>
          {aiModeActive && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 font-bold">
              🤖 AI
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5  bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-500 truncate">
            {t?.online ?? "online"} · {typeof character.title === 'object' ? character.title[lang] || character.title.en : character.title}
          </span>
        </div>
      </div>

      {/* Mobile Stats Toggle Button */}
      <button
        type="button"
        onClick={onToggleMobileSidebar}
        className="md:hidden flex items-center gap-1 font-mono text-xs px-2.5 py-1  bg-slate-900 border border-slate-700 text-slate-300 hover:text-white shrink-0"
        title="View partner stats & switcher"
      >
        <span>📊</span>
        <span>Stats</span>
      </button>

      {/* Desktop stats right cluster */}
      <div className="ml-auto hidden sm:flex items-center gap-3 shrink-0">
        {/* Quick Love Hub Pill Button */}
        <button
          onClick={onOpenLoveHub}
          className="flex items-center gap-1.5 px-3 py-1  bg-slate-900 border border-slate-700 hover:border-fuchsia-500 transition-all text-xs font-mono"
          title="Open Love Metrics & Reactions"
        >
          <span>💖</span>
          <span className="text-slate-300 font-bold">{charState.relationship}%</span>
          <span className="text-slate-500 text-[10px]">Bond</span>
        </button>

        <div
          className={`px-3 py-1  text-xs font-bold border ${mood?.bgClass || 'bg-slate-900'} ${mood?.textClass || 'text-cyan-400'}`}
          style={{ borderColor: borderColor + '60' }}
        >
          {t?.moods?.[charState.mood] || charState.mood}
        </div>
      </div>
    </div>
  );
}
