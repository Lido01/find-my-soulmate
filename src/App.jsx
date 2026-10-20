// ─────────────────────────────────────────────────────────────────────────────
// App.jsx — Root application shell (refactored, all milestones)
// Commit: feat: wire up full App shell with AI mode, gifts, and language toggle
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback } from 'react';
import { CHARACTERS, MOOD_META } from './data/characters.js';
import { useLang } from './context/LanguageContext.jsx';
import { useGameState } from './hooks/useGameState.js';
import { loadApiKey, saveApiKey, clearApiKey } from './utils/storage.js';
import { validateApiKey } from './utils/gemini.js';

// Layout components
import HeaderBar from './components/layout/HeaderBar.jsx';
import Sidebar from './components/layout/Sidebar.jsx';
import FooterConsole from './components/layout/FooterConsole.jsx';

// Chat components
import ChatFeed from './components/chat/ChatFeed.jsx';

// Character components
import CharacterSelectScreen from './components/character/CharacterSelectScreen.jsx';

// Modal components
import GiftModal from './components/gifts/GiftModal.jsx';
import ApiKeyModal from './components/settings/ApiKeyModal.jsx';

// UI components
import MoodToast from './components/ui/MoodToast.jsx';
import LoveWordBubble from './components/ui/LoveWordBubble.jsx';

export default function App() {
  const { lang, t } = useLang();
  const [apiKey, setApiKeyState] = useState(() => loadApiKey());
  const [showApiModal, setShowApiModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [moodToast, setMoodToast] = useState({ mood: null, visible: false });

  // Mood change callback
  const handleMoodChange = useCallback((mood) => {
    setMoodToast({ mood, visible: true });
    setTimeout(() => setMoodToast({ mood: null, visible: false }), 2800);
  }, []);

  // Game state hook
  const {
    gameState, isTyping, aiError, feedRef,
    activeCharacter, activeCharState, activeDialogue,
    phase,
    handleSelectCharacter, handleChoice, handleGift,
    handleSwitchCharacter, handleBack, handleReset,
  } = useGameState({ apiKey, lang, onMoodChange: handleMoodChange });

  // API key management
  const handleApiKeySave = useCallback(async (key) => {
    if (!key) { clearApiKey(); setApiKeyState(''); return true; }
    const valid = await validateApiKey(key);
    if (valid) { saveApiKey(key); setApiKeyState(key); return true; }
    return false;
  }, []);

  const handleGiftSend = useCallback((gift) => {
    setShowGiftModal(false);
    handleGift(gift, lang);
  }, [handleGift, lang]);

  const canGift = activeCharState && activeCharState.relationship >= 35;
  const aiModeActive = Boolean(apiKey);

  return (
    <div className="h-full flex flex-col bg-slate-950 font-mono overflow-hidden select-none">
      {/* Top header */}
      <HeaderBar
        phase={phase}
        activeCharacter={activeCharacter}
        charState={activeCharState}
        onReset={handleReset}
        onBack={handleBack}
        onApiKeyClick={() => setShowApiModal(true)}
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
        <main className="flex-1 flex flex-col overflow-hidden">
          {phase === 'select' ? (
            <CharacterSelectScreen
              allCharacters={CHARACTERS}
              allCharStates={gameState.characters}
              onSelect={handleSelectCharacter}
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
                  t={t}
                  lang={lang}
                  aiModeActive={aiModeActive}
                />
              )}

              {/* AI Error banner */}
              {aiError && (
                <div className="flex-shrink-0 bg-red-900/30 border-b border-red-800/50 px-4 py-2 text-xs text-red-400 flex items-center gap-2">
                  <span>⚠</span>
                  <span>AI Error: {aiError} — using scripted mode</span>
                </div>
              )}

              {/* Chat feed */}
              {activeCharacter && (
                <ChatFeed
                  messages={activeCharState?.messages || []}
                  character={activeCharacter}
                  isTyping={isTyping}
                  feedRef={feedRef}
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
                  isTyping={isTyping}
                  t={t}
                  lang={lang}
                  onGiftClick={() => setShowGiftModal(true)}
                  canGift={canGift}
                  aiModeActive={aiModeActive}
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

      {/* Ambient overlays */}
      <MoodToast mood={moodToast.mood} visible={moodToast.visible} t={t} lang={lang} />
      <LoveWordBubble lang={lang} />
    </div>
  );
}

// ── Inline Chat Header ────────────────────────────────────────────────────────
function ChatHeader({ character, charState, t, lang, aiModeActive }) {
  const mood = MOOD_META[charState.mood];
  return (
    <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b border-slate-800 bg-slate-950/90 backdrop-blur-sm">
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${character.avatarBg} flex items-center justify-center text-sm font-black text-white border-2 flex-shrink-0`}
        style={{ borderColor: character.borderColor, boxShadow: `0 0 10px ${character.borderColor}50` }}
      >
        {character.avatarInitials}
      </div>

      {/* Name row */}
      <div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-black ${character.textClass}`}>{character.name}</span>
          <span className="text-xs text-slate-600">{character.handle}</span>
          <span>{mood?.emoji}</span>
          {aiModeActive && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-900/40 border border-emerald-700/50 text-emerald-400">🤖 AI</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-slate-500">{t.online} · {typeof character.title === 'object' ? character.title[lang] || character.title.en : character.title}</span>
        </div>
      </div>

      {/* Right stats */}
      <div className="ml-auto hidden sm:flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs text-slate-600">{t.relationship}</p>
          <p className={`text-sm font-black ${character.textClass}`}>{charState.relationship}%</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-600">{t.choicesMade}</p>
          <p className={`text-sm font-black ${character.textClass}`}>{charState.totalChoicesMade}</p>
        </div>
        <div
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${mood?.bgClass} ${mood?.textClass}`}
          style={{ borderColor: character.borderColor + '60' }}
        >
          {t.moods?.[charState.mood] || charState.mood}
        </div>
      </div>
    </div>
  );
}
