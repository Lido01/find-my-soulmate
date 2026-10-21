// Commit: feat(hooks): refine useGameState with handleCustomMessage, fixed typing timing, and AI integration

import { useState, useEffect, useRef, useCallback } from 'react';
import { CHARACTERS, MOODS } from '../data/characters.js';
import { DIALOGUES } from '../data/dialogues.js';
import { loadState, saveState, purgeState, buildInitialState } from '../utils/storage.js';
import { sendGeminiMessage } from '../utils/gemini.js';
import { LOVE_WORDS, AMHARIC_PHRASES } from '../data/i18n.js';

const MOOD_ORDER = [MOODS.DONE, MOODS.STRESSED, MOODS.CURIOUS, MOODS.CAFFEINATED, MOODS.SMITTEN];

function clamp(val, min, max) { return Math.min(max, Math.max(min, val)); }

function shiftMood(currentMood, delta) {
  const idx = MOOD_ORDER.indexOf(currentMood);
  if (idx < 0) return currentMood;
  if (delta > 15) return MOOD_ORDER[Math.min(idx + 1, MOOD_ORDER.length - 1)];
  if (delta < -10) return MOOD_ORDER[Math.max(idx - 1, 0)];
  return currentMood;
}

export function useGameState({ apiKey, lang = 'en', onMoodChange }) {
  const [gameState, setGameState] = useState(() => {
    const saved = loadState();
    return saved || buildInitialState(CHARACTERS);
  });
  const [isTyping, setIsTyping] = useState(false);
  const [aiError, setAiError] = useState(null);
  const feedRef = useRef(null);

  // Auto-save state changes
  useEffect(() => {
    saveState(gameState);
  }, [gameState]);

  // Auto-scroll chat feed
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
      const cs = prev.characters[id] || {
        messages: [],
        currentDialogueId: 'intro',
        relationship: 10,
        mood: 'curious',
        unlockedDialogues: ['intro'],
        totalChoicesMade: 0,
        giftsGiven: [],
        totalGiftsValue: 0,
      };

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

  // ── Helper to push scripted reply ─────────────────────────────────────────
  const _pushScriptedReply = useCallback((choice, prevMood) => {
    setGameState((prev) => {
      const cs = prev.characters[prev.selectedCharacterId];
      if (!cs) return prev;
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
  }, [onMoodChange]);

  // ── Handle player choice from branching options ───────────────────────────
  const handleChoice = useCallback(async (choice) => {
    if (isTyping) return;
    setAiError(null);

    const playerMsg = {
      id: `msg_${Date.now()}_p`,
      sender: 'player',
      text: choice.label || choice.text || String(choice),
      timestamp: new Date().toISOString(),
    };

    let prevMoodRef = activeCharState?.mood || 'curious';

    setGameState((prev) => {
      const cs = prev.characters[prev.selectedCharacterId];
      if (!cs) return prev;
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
    const delay = 1200 + Math.random() * 800;

    if (apiKey) {
      // ── AI Mode via Gemini ────────────────────────────────────────────────
      try {
        const character = CHARACTERS[selectedCharacterId];
        const history = (gameState.characters[selectedCharacterId]?.messages || []).slice(-10);

        const aiText = await sendGeminiMessage({
          apiKey,
          systemPrompt: character.aiSystemPrompt,
          history,
          userMessage: playerMsg.text,
          lang,
        });

        setGameState((prev) => {
          const cs = prev.characters[prev.selectedCharacterId];
          if (!cs) return prev;
          const moodDelta = aiText.includes('💖') || aiText.includes('ፍቅር') || aiText.includes('❤️') ? 18 : 2;
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
                relationship: clamp(cs.relationship + 4, 0, 100),
                currentDialogueId: choice.next || cs.currentDialogueId,
              },
            },
          };
        });
      } catch (err) {
        setAiError(err.message || 'AI connection failed — using scripted response');
        _pushScriptedReply(choice, prevMoodRef);
      } finally {
        setIsTyping(false);
      }
    } else {
      // ── Scripted Mode ─────────────────────────────────────────────────────
      setTimeout(() => {
        _pushScriptedReply(choice, prevMoodRef);
        setIsTyping(false);
      }, delay);
    }
  }, [isTyping, apiKey, lang, selectedCharacterId, gameState, activeCharState, onMoodChange, _pushScriptedReply]);

  // ── Handle freeform custom text typed by player ───────────────────────────
  const handleCustomMessage = useCallback(async (userText) => {
    if (isTyping || !userText.trim()) return;
    setAiError(null);

    const playerMsg = {
      id: `msg_${Date.now()}_p`,
      sender: 'player',
      text: userText.trim(),
      timestamp: new Date().toISOString(),
    };

    let prevMoodRef = activeCharState?.mood || 'curious';

    setGameState((prev) => {
      const cs = prev.characters[prev.selectedCharacterId];
      if (!cs) return prev;
      prevMoodRef = cs.mood;
      return {
        ...prev,
        characters: {
          ...prev.characters,
          [prev.selectedCharacterId]: {
            ...cs,
            messages: [...cs.messages, playerMsg],
            relationship: clamp(cs.relationship + 2, 0, 100),
            totalChoicesMade: cs.totalChoicesMade + 1,
          },
        },
      };
    });

    setIsTyping(true);
    const delay = 1200 + Math.random() * 800;

    if (apiKey) {
      // ── Real Gemini AI Reply ──────────────────────────────────────────────
      try {
        const character = CHARACTERS[selectedCharacterId];
        const history = (gameState.characters[selectedCharacterId]?.messages || []).slice(-10);

        const aiText = await sendGeminiMessage({
          apiKey,
          systemPrompt: character.aiSystemPrompt,
          history,
          userMessage: userText.trim(),
          lang,
        });

        setGameState((prev) => {
          const cs = prev.characters[prev.selectedCharacterId];
          if (!cs) return prev;
          const moodDelta = aiText.includes('💖') || aiText.includes('ፍቅር') || aiText.includes('❤️') ? 15 : 3;
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
                relationship: clamp(cs.relationship + 4, 0, 100),
              },
            },
          };
        });
      } catch (err) {
        setAiError(err.message || 'AI connection failed — using scripted response');
        _generateScriptedCustomReply(userText, prevMoodRef);
      } finally {
        setIsTyping(false);
      }
    } else {
      // ── Scripted Personality Reply for Custom Text ────────────────────────
      setTimeout(() => {
        _generateScriptedCustomReply(userText, prevMoodRef);
        setIsTyping(false);
      }, delay);
    }
  }, [isTyping, apiKey, lang, selectedCharacterId, gameState, activeCharState, onMoodChange]);

  // Generates character-themed reply for custom text in offline/scripted mode
  function _generateScriptedCustomReply(userText, prevMood) {
    setGameState((prev) => {
      const cs = prev.characters[prev.selectedCharacterId];
      if (!cs) return prev;
      const charId = prev.selectedCharacterId;
      const character = CHARACTERS[charId];

      let replyText = "";
      const lower = userText.toLowerCase();

      if (charId === 'linus') {
        if (lower.includes('space') || lower.includes('tab')) {
          replyText = "$ grep -i 'indent' /etc/style\nRule 1: Tabs only. Don't test my blood pressure.\n...Although you saying it directly to my face is bold. I'll give you that.";
        } else if (lower.includes('rebase') || lower.includes('git') || lower.includes('commit')) {
          replyText = "$ git log --author='you' --stat\nNow you're talking my language. Let's inspect the diff together. 💚";
        } else if (lower.includes('love') || lower.includes('heart') || lower.includes('እወድ') || lower.includes('ፍቅር')) {
          replyText = "[kernel panic: emotional buffer overrun]\nI'm a kernel hacker, not a poet...\n...but my uptime is 100% when you're connected. 🥺💖";
        } else {
          replyText = `$ echo "${userText}" >> /dev/heart\nNoted. Your packet arrived with 0% loss.\nTell me what you're compiling right now.`;
        }
      } else {
        // Devon
        if (lower.includes('css') || lower.includes('flex') || lower.includes('grid')) {
          replyText = "CSS?! Did you say CSS?! 💅✨\nLiterally nothing is centering properly right now and I'm 4 cold brews deep. Pair with me please!";
        } else if (lower.includes('coffee') || lower.includes('brew') || lower.includes('ቡና')) {
          replyText = "COFFEE! ☕☕☕\nYou understand me on a spiritual level. Ethiopian Yirgacheffe or cold brew next round on me!";
        } else if (lower.includes('love') || lower.includes('heart') || lower.includes('እወድ') || lower.includes('ፍቅር')) {
          replyText = "omg 🥺💖\nMy heartbeat has better animations than Framer Motion right now. You are too sweet!!";
        } else {
          replyText = `"${userText}"\nokay YES! I'm completely listening between Vite builds. Tell me more, don't leave me hanging! ⚡`;
        }
      }

      return {
        ...prev,
        characters: {
          ...prev.characters,
          [prev.selectedCharacterId]: {
            ...cs,
            messages: [...cs.messages, {
              id: `msg_${Date.now()}_r`,
              sender: 'partner',
              text: replyText,
              timestamp: new Date().toISOString(),
            }],
            relationship: clamp(cs.relationship + 3, 0, 100),
          },
        },
      };
    });
  }

  // ── Send gift ─────────────────────────────────────────────────────────────
  const handleGift = useCallback((gift, currentLang) => {
    const giftName = typeof gift.name === 'object'
      ? (gift.name[currentLang] || gift.name.en || 'Gift')
      : gift.name;

    const giftMsg = {
      id: `msg_${Date.now()}_gift`,
      sender: 'player',
      text: `🎁 Sent: ${giftName}`,
      timestamp: new Date().toISOString(),
      isGift: true,
      gift,
    };

    setGameState((prev) => {
      const cs = prev.characters[prev.selectedCharacterId];
      if (!cs) return prev;
      return {
        ...prev,
        characters: {
          ...prev.characters,
          [prev.selectedCharacterId]: {
            ...cs,
            messages: [...cs.messages, giftMsg],
            relationship: clamp(cs.relationship + (gift.boost || 15), 0, 100),
            giftsGiven: [...(cs.giftsGiven || []), gift.id],
            totalGiftsValue: (cs.totalGiftsValue || 0) + (gift.boost || 15),
          },
        },
      };
    });

    setIsTyping(true);
    setTimeout(() => {
      setGameState((prev) => {
        const cs = prev.characters[prev.selectedCharacterId];
        if (!cs) return prev;
        const charId = prev.selectedCharacterId;

        let replyText = "";
        if (charId === 'linus') {
          replyText = `*inspects ${giftName}*\n...\n$ git commit -m "feat: receive most thoughtful gift ever"\nI don't usually accept bribes, but for you... I'll merge this directly into main. 🥺💚`;
        } else {
          replyText = `OH MY GOD 😭✨ ${giftName}!!\nYou actually got this for me?! This is the best thing that happened this whole sprint!! 💖☕`;
        }

        const words = LOVE_WORDS[currentLang] || LOVE_WORDS.en;
        const loveWord = words[Math.floor(Math.random() * words.length)];

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
    }, 1400);
  }, [onMoodChange]);

  // ── Switch character ──────────────────────────────────────────────────────
  const handleSwitchCharacter = useCallback((id) => {
    const cs = gameState.characters[id];
    if (!cs || cs.messages.length === 0) {
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
    handleSelectCharacter, handleChoice, handleCustomMessage, handleGift,
    handleSwitchCharacter, handleBack, handleReset,
  };
}
