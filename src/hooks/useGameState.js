// ─────────────────────────────────────────────────────────────────────────────
// useGameState.js — Central game state hook
// Commit: feat: extract game state into custom useGameState hook
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react';
import { CHARACTERS, MOODS, MOOD_META } from '../data/characters.js';
import { DIALOGUES } from '../data/dialogues.js';
import { loadState, saveState, purgeState, buildInitialState } from '../utils/storage.js';
import { sendGeminiMessage } from '../utils/gemini.js';
import { LOVE_WORDS } from '../data/i18n.js';

const MOOD_ORDER = [MOODS.DONE, MOODS.STRESSED, MOODS.CURIOUS, MOODS.CAFFEINATED, MOODS.SMITTEN];

function clamp(val, min, max) { return Math.min(max, Math.max(min, val)); }

function shiftMood(currentMood, delta) {
  const idx = MOOD_ORDER.indexOf(currentMood);
  if (idx < 0) return currentMood;
  if (delta > 15) return MOOD_ORDER[Math.min(idx + 1, MOOD_ORDER.length - 1)];
  if (delta < -10) return MOOD_ORDER[Math.max(idx - 1, 0)];
  return currentMood;
}

export function useGameState({ apiKey, lang, onMoodChange }) {
  const [gameState, setGameState] = useState(() => {
    const saved = loadState();
    return saved || buildInitialState(CHARACTERS);
  });
  const [isTyping, setIsTyping] = useState(false);
  const [aiError, setAiError] = useState(null);
  const feedRef = useRef(null);

  // Auto-save
  useEffect(() => { saveState(gameState); }, [gameState]);

  // Auto-scroll
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [gameState, isTyping]);

  const { selectedCharacterId, phase } = gameState;
  const activeCharacter = selectedCharacterId ? CHARACTERS[selectedCharacterId] : null;
  const activeCharState = selectedCharacterId ? gameState.characters[selectedCharacterId] : null;
  const activeDialogue = activeCharState
    ? DIALOGUES[selectedCharacterId]?.[activeCharState.currentDialogueId]
    : null;

  // ── Select character ──────────────────────────────────────────────────────
  const handleSelectCharacter = useCallback((id) => {
    setGameState((prev) => {
      const cs = prev.characters[id];
      if (cs.messages.length === 0) {
        const intro = DIALOGUES[id]?.intro;
        if (intro) {
          return {
            ...prev,
            selectedCharacterId: id,
            phase: 'chat',
            characters: {
              ...prev.characters,
              [id]: {
                ...cs,
                messages: [{
                  id: `msg_${Date.now()}`,
                  sender: 'partner',
                  text: intro.partnerMessage,
                  timestamp: new Date().toISOString(),
                }],
                mood: intro.mood || cs.mood,
                currentDialogueId: 'intro',
              },
            },
          };
        }
      }
      return { ...prev, selectedCharacterId: id, phase: 'chat' };
    });
  }, []);

  // ── Handle player choice ──────────────────────────────────────────────────
  const handleChoice = useCallback(async (choice) => {
    if (isTyping) return;
    setAiError(null);

    // Push player message immediately
    const playerMsg = {
      id: `msg_${Date.now()}_p`,
      sender: 'player',
      text: choice.label,
      timestamp: new Date().toISOString(),
    };

    let prevMoodRef = null;

    setGameState((prev) => {
      const cs = prev.characters[prev.selectedCharacterId];
      prevMoodRef = cs.mood;
      const newMood = shiftMood(cs.mood, choice.moodDelta || 0);
      return {
        ...prev,
        characters: {
          ...prev.characters,
          [prev.selectedCharacterId]: {
            ...cs,
            messages: [...cs.messages, playerMsg],
            relationship: clamp(cs.relationship + (choice.relationshipDelta || 0), 0, 100),
            mood: newMood,
            totalChoicesMade: cs.totalChoicesMade + 1,
          },
        },
      };
    });

    setIsTyping(true);

    // Typing delay: 1.2–2s
    const delay = 1200 + Math.random() * 800;

    if (apiKey) {
      // ── AI Mode: call Gemini ────────────────────────────────────────────
      try {
        const character = CHARACTERS[selectedCharacterId];
        // Collect recent message history
        const history = gameState.characters[selectedCharacterId].messages.slice(-12);
        const aiText = await new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const text = await sendGeminiMessage({
                apiKey,
                systemPrompt: character.aiSystemPrompt,
                history,
                userMessage: choice.label,
                lang,
              });
              resolve(text);
            } catch (err) { reject(err); }
          }, delay);
        });

        setGameState((prev) => {
          const cs = prev.characters[prev.selectedCharacterId];
          // AI doesn't use dialogue tree — pick a random mood boost
          const moodDelta = aiText.includes('💖') || aiText.includes('❤️') ? 18 : 0;
          const newMood = shiftMood(cs.mood, moodDelta);
          if (newMood !== prevMoodRef) onMoodChange?.(newMood);
          return {
            ...prev,
            characters: {
              ...prev.characters,
              [prev.selectedCharacterId]: {
                ...cs,
                messages: [...cs.messages, {
                  id: `msg_${Date.now()}_ai`,
                  sender: 'partner',
                  text: aiText,
                  timestamp: new Date().toISOString(),
                  isAI: true,
                }],
                mood: newMood,
                relationship: clamp(cs.relationship + 3, 0, 100),
                // In AI mode we don't advance dialogue tree
                currentDialogueId: cs.currentDialogueId,
              },
            },
          };
        });
      } catch (err) {
        setAiError(err.message || 'AI error — falling back to scripted mode');
        // Fall back to scripted dialogue
        _pushScriptedReply(choice, prevMoodRef);
      }
    } else {
      // ── Scripted Mode ───────────────────────────────────────────────────
      setTimeout(() => { _pushScriptedReply(choice, prevMoodRef); }, delay);
    }

    setIsTyping(false);
  }, [isTyping, apiKey, lang, selectedCharacterId, gameState]);

  function _pushScriptedReply(choice, prevMood) {
    setGameState((prev) => {
      const cs = prev.characters[prev.selectedCharacterId];
      const nextDialogue = DIALOGUES[prev.selectedCharacterId]?.[choice.next];
      if (!nextDialogue) return prev;

      const newMood = nextDialogue.mood || cs.mood;
      if (newMood !== (prevMood || cs.mood)) onMoodChange?.(newMood);

      return {
        ...prev,
        characters: {
          ...prev.characters,
          [prev.selectedCharacterId]: {
            ...cs,
            messages: [...cs.messages, {
              id: `msg_${Date.now()}_r`,
              sender: 'partner',
              text: nextDialogue.partnerMessage,
              timestamp: new Date().toISOString(),
            }],
            currentDialogueId: choice.next,
            mood: newMood,
            relationship: clamp(cs.relationship + (nextDialogue.relationshipDelta || 0), 0, 100),
            unlockedDialogues: cs.unlockedDialogues.includes(choice.next)
              ? cs.unlockedDialogues : [...cs.unlockedDialogues, choice.next],
          },
        },
      };
    });
  }

  // ── Send gift ─────────────────────────────────────────────────────────────
  const handleGift = useCallback((gift, lang) => {
    const giftMsg = {
      id: `msg_${Date.now()}_gift`,
      sender: 'player',
      text: `🎁 Sent: ${gift.name[lang] || gift.name.en}`,
      timestamp: new Date().toISOString(),
      isGift: true,
      gift,
    };

    setGameState((prev) => {
      const cs = prev.characters[prev.selectedCharacterId];
      return {
        ...prev,
        characters: {
          ...prev.characters,
          [prev.selectedCharacterId]: {
            ...cs,
            messages: [...cs.messages, giftMsg],
            relationship: clamp(cs.relationship + gift.boost, 0, 100),
            giftsGiven: [...(cs.giftsGiven || []), gift.id],
            totalGiftsValue: (cs.totalGiftsValue || 0) + gift.boost,
          },
        },
      };
    });

    // Partner gift reaction after delay
    setIsTyping(true);
    setTimeout(() => {
      setGameState((prev) => {
        const cs = prev.characters[prev.selectedCharacterId];
        const t_fn = DIALOGUES[prev.selectedCharacterId]?.giftResponse;
        const replyText = t_fn ? t_fn(gift.name[lang] || gift.name.en)
          : `✨ Oh wow... ${gift.name.en}?! You didn't have to! This means everything to me 🥺💖`;

        // Love word flourish
        const loveWords = LOVE_WORDS[lang] || LOVE_WORDS.en;
        const loveWord = loveWords[Math.floor(Math.random() * loveWords.length)];

        return {
          ...prev,
          characters: {
            ...prev.characters,
            [prev.selectedCharacterId]: {
              ...cs,
              messages: [...cs.messages, {
                id: `msg_${Date.now()}_greact`,
                sender: 'partner',
                text: `${replyText}\n\n${loveWord}`,
                timestamp: new Date().toISOString(),
              }],
              mood: MOODS.SMITTEN,
            },
          },
        };
      });
      setIsTyping(false);
      onMoodChange?.(MOODS.SMITTEN);
    }, 1500);
  }, [lang, onMoodChange]);

  // ── Switch character ──────────────────────────────────────────────────────
  const handleSwitchCharacter = useCallback((id) => {
    const cs = gameState.characters[id];
    if (cs && cs.messages.length === 0) {
      handleSelectCharacter(id);
    } else {
      setGameState((prev) => ({ ...prev, selectedCharacterId: id }));
    }
  }, [gameState.characters, handleSelectCharacter]);

  // ── Back to select ────────────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    setGameState((prev) => ({ ...prev, phase: 'select', selectedCharacterId: null }));
  }, []);

  // ── Hard reset ────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    purgeState();
    setIsTyping(false);
    setAiError(null);
    setGameState({ ...buildInitialState(CHARACTERS), phase: 'select', selectedCharacterId: null });
  }, []);

  return {
    gameState, isTyping, aiError, feedRef,
    activeCharacter, activeCharState, activeDialogue,
    selectedCharacterId, phase,
    handleSelectCharacter, handleChoice, handleGift,
    handleSwitchCharacter, handleBack, handleReset,
  };
}
