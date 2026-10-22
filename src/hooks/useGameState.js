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
        const currentRel = gameState.characters[selectedCharacterId]?.relationship ?? 15;

        const aiText = await sendGeminiMessage({
          apiKey,
          character,
          systemPrompt: character.aiSystemPrompt,
          history,
          userMessage: playerMsg.text,
          lang,
          relationship: currentRel,
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

  // ── Handle freeform custom text & voice audio typed/spoken by player ───
  const handleCustomMessage = useCallback(async (userText, options = {}) => {
    if (isTyping || !userText.trim()) return;
    setAiError(null);

    const isAudio = Boolean(options.isAudio);
    const audioDuration = options.audioDuration || null;

    const playerMsg = {
      id: `msg_${Date.now()}_p`,
      sender: 'player',
      text: userText.trim(),
      timestamp: new Date().toISOString(),
      isAudio,
      audioDuration,
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
        const currentRel = gameState.characters[selectedCharacterId]?.relationship ?? 15;

        const aiText = await sendGeminiMessage({
          apiKey,
          character,
          systemPrompt: character.aiSystemPrompt,
          history,
          userMessage: userText.trim(),
          lang,
          relationship: currentRel,
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

  // Generates realistic, emoji-packed romantic reply with real human resistance & persuasion dynamics
  function _generateScriptedCustomReply(userText, prevMood) {
    setGameState((prev) => {
      const cs = prev.characters[prev.selectedCharacterId];
      if (!cs) return prev;
      const charId = prev.selectedCharacterId;
      const character = CHARACTERS[charId];
      const rel = cs.relationship ?? 15;

      const lower = userText.toLowerCase();
      const isAm = lang === 'am';
      let replyText = "";

      // Check if user is professing love, asking to be partners, or begging for a "yes"
      const isLoveOrPropose = lower.includes('love') || lower.includes('heart') || lower.includes('እወድ') || lower.includes('ፍቅር') || lower.includes('ቆንጆ') || lower.includes('ውድ') || lower.includes('ልብ') || lower.includes('say yes') || lower.includes('be my') || lower.includes('እሺ') || lower.includes('please') || lower.includes('እባክ');
      const isCode = lower.includes('code') || lower.includes('git') || lower.includes('css') || lower.includes('tab') || lower.includes('space') || lower.includes('bug') || lower.includes('rebase') || lower.includes('ኮድ');
      const isCoffee = lower.includes('coffee') || lower.includes('brew') || lower.includes('tea') || lower.includes('ቡና');

      // If user rushes or begs at low/medium bond, characters PLAYFULLY RESIST and demand to be persuaded!
      const shouldResist = isLoveOrPropose && rel < 65;

      if (charId === 'lina') {
        // Lina (Girlfriend 🇸🇪 — blunt kernel maintainer)
        if (isAm) {
          if (shouldResist) {
            replyText = "ቀስ በል እንጂ! ✋ ገና ዛሬ ተዋወቅን እኮ። በከርነል ውስጥ እንኳን ኮድ ሳይመረመር አይጸድቅም። በቀላሉ 'እሺ' እንድልህ አትጠብቅ... እስኪ አሳምነኝ ምን ያህል እውነተኛ ነህ? 😏💚";
          } else if (isLoveOrPropose) {
            replyText = "አሳመንከኝ... እሺ የኔ ፍቅር! ከርነል ኮድ ሳደርግ እንደዚህ ልቤ ደስ ብሎት አያውቅም። እኔም ከልቤ አፈቅርሃለሁ! 🥺💖";
          } else if (isCode) {
            replyText = "ንጹህ የ git rebase ታሪክ? እንደዚህ ያለ ፍጹም ኮድ ስታሳይ ልቤ መረጋጋት ያቅተዋል። አብረን እንስራ! ☕💚";
          } else if (isCoffee) {
            replyText = "አረንጓዴ ሻይ እያዘጋጀሁ ነው። አንተ አጠገቤ ከሆንክ ስራው ሁሉ ይቀለኛል! 🍵✨";
          } else {
            replyText = "መልእክትህን ተቀብያለሁ የኔ ቆንጆ። አጠገቤ ሆነህ ስትጽፍልኝ ስራዬ ሁሉ ያበራል! 💻🌹";
          }
        } else {
          if (shouldResist) {
            replyText = "Whoa, hold your horses! ✋ You don't even know my favorite kernel version and you're already asking me to say yes? 😏 You have to earn that with clean architecture and real effort. Persuade me!";
          } else if (isLoveOrPropose) {
            replyText = "Okay... fine. You completely broke through my firewall and persuaded me. Yes, I'm yours, and I love you too, you stubborn dev. 🥺💖";
          } else if (isCode) {
            replyText = "Tabs only, clean rebase, and zero warnings. You truly know how to win a kernel hacker's heart. Let's inspect the diff together. ☕💚";
          } else if (isCoffee) {
            replyText = "Green tea is brewing. Take a break from coding and sit with me for a minute, handsome. 🍵✨";
          } else {
            replyText = "Packet arrived with 0% loss, my favorite person. Tell me how your day went while I review this commit! 💻🌹";
          }
        }
      } else if (charId === 'dani') {
        // Dani (Girlfriend 🇺🇸 — chaotic frontend ninja)
        if (isAm) {
          if (shouldResist) {
            replyText = "ዋው ቀስ በል! 🙈 ልቤን በአንድ ቃል ማሸነፍ አትችልም! መጀመሪያ ቀዝቃዛ ቡና ጋብዘኝ፣ ኮዴን አግዘኝና አሳምነኝ እንጂ ዝም ብለህ 'እሺ' አትበለኝ! 😏☕";
          } else if (isLoveOrPropose) {
            replyText = "OMG አሳመንከኝ!! 🥺💖 ልቤ እንዳለቀለት አኒሜሽን እየዘለለ ነው። አዎ እሺ፣ እኔም በጣም ነው የማፈቅርህ!";
          } else if (isCode) {
            replyText = "CSS flexbox አብረን እንስራ? አንተ አጠገቤ ከሆንክ ምንም ሳንካ አያሳስበኝም! 💅✨";
          } else if (isCoffee) {
            replyText = "ቀዝቃዛ ቡናዬን እየጠጣሁ ስለ አንተ ሳስብ ነበር! ሁለተኛውን ዙር አብረን እንጠጣ! ☕🥰";
          } else {
            replyText = "ሙሉ በሙሉ እየሰማሁህ ነው የኔ ውድ! የአንተ መልእክት ሁሌም ቀኔን 100 እጥፍ ያደምቀዋል! ⚡💖";
          }
        } else {
          if (shouldResist) {
            replyText = "Hahaha wait wait wait! 🙈 You can't just speedrun my heart like that! Buy me a cold brew first or help me center this stubborn div. Persuade me to say yes, cutie! ☕✨";
          } else if (isLoveOrPropose) {
            replyText = "OMG OKAY YES!! You totally convinced me! My heart has better animations than Framer Motion right now, I love you so much! 🥺💖";
          } else if (isCode) {
            replyText = "CSS centering problems vanish the second you text me. Take a sip of cold brew and let's pair! 💅✨";
          } else if (isCoffee) {
            replyText = "COFFEE! ☕☕☕ You understand me on a spiritual level. Ethiopian Yirgacheffe or cold brew next round on me!";
          } else {
            replyText = "I'm totally listening between my build tasks! Your messages always make my whole day 100x brighter. ⚡🥰";
          }
        }
      } else if (charId === 'senait') {
        // Senait (Girlfriend 🇪🇹 — AI researcher)
        if (isAm) {
          if (shouldResist) {
            replyText = "ቀስ እንበል የኔ ቆንጆ! 😅 ገና እኮ ቡና እንኳን አብረን አልጠጣንም። እኔ በቀላሉ 'እሺ' የምል ሴት አይደለሁም... እስኪ አሳምነኝ ምን ያህል እውነተኛ እንደሆንክ? ☕🌹";
          } else if (isLoveOrPropose) {
            replyText = "አሳመንከኝ የኔ ውድ... አሁን በሙሉ ልቤ 'እሺ' እልሃለሁ! እኔም ከልቤ አፈቅርሃለሁ የኔ ፍቅር! 🥺🌹";
          } else if (isCode) {
            replyText = "የኔ ጎበዝ፣ በ AI ሞዴሌ ትልቁ እና ውቡ ክብደት (weight) ያንተ ፍቅር ነው! 🧠💖";
          } else if (isCoffee) {
            replyText = "የጀበና ቡና እየፈላ ነው! ሽታው እና ያንተ ፍቅር አንድ ላይ ውስጤን ሞልቶታል። 🫘✨";
          } else {
            replyText = "ሰላም የኔ ቆንጆ! ቀንህ እንዴት አለፈ? የአንተ መልእክት ሁሌም ውስጤን ያረጋጋዋል። ✨🥰";
          }
        } else {
          if (shouldResist) {
            replyText = "Wait, really? Already? 😅 In deep learning we train for epochs before convergence. What makes you think you've won my heart so quickly? Persuade me! 🧠💖";
          } else if (isLoveOrPropose) {
            replyText = "My love... you completely persuaded me. You have the highest attention score in my entire heart. I love you too. ☕🌹";
          } else if (isCode) {
            replyText = "Zero loss, infinite accuracy whenever you're around. Let's brew some Yirgacheffe and talk for hours. 🧠💖";
          } else if (isCoffee) {
            replyText = "Traditional Jebena bunna is on the stove! Come sit with me, my dear. 🫘✨";
          } else {
            replyText = "Hey sweet soul! Hearing from you is my favorite part of the entire day. Tell me everything! ✨🥰";
          }
        }
      } else if (charId === 'linus') {
        // Linus (Boyfriend 🇫🇮 — systems architect)
        if (isAm) {
          if (shouldResist) {
            replyText = "ቀስ በይ የኔ ቆንጆ... የኔ ልብ እንደ ማንኛውም ቀላል ነገር ዝም ብሎ 'እሺ' አይልም። በከርነል ላይ እንኳን ብዙ ታገስሻለሁ። እስኪ አሳምኚኝ ምን ያህል ከልብሽ እንደሆነ? 😏💚";
          } else if (isLoveOrPropose) {
            replyText = "አሳመንሺኝ... እሺ የኔ ቆንጆ! የኔ ስሜታዊ ፋየርዎል ተከፍቷል። እኔም ከልቤ አፈቅርሻለሁ! 🥺💖";
          } else if (isCode) {
            replyText = "የኔ ቆንጆ፣ ትክክለኛ tabs ተጠቅመሽ ኮድ ስታደርጊ ልቤ ይሞቃል። ጎበዜ ነሽ! 💚";
          } else if (isCoffee) {
            replyText = "ጥቁር ቡና አፍልቼ ስለ አንቺ እያሰብኩ ነበር። አብረን እረፍት እንውሰድ? ☕✨";
          } else {
            replyText = "መልእክትሽ ደርሶኛል የኔ ፍቅር። በስራ መሀል የአንቺ መልእክት ሲመጣ ሙሉ በሙሉ እረፍት ይሰጠኛል። 💻🌹";
          }
        } else {
          if (shouldResist) {
            replyText = "Hold on. The handshake protocol isn't complete yet. You want my heart? You need to show me dedication and clean architecture first. Persuade me, beautiful. 😏💚";
          } else if (isLoveOrPropose) {
            replyText = "You won. You completely persuaded me. Emotional firewall disabled. I'm yours, and I love you too, beautiful. 🥺💚";
          } else if (isCode) {
            replyText = "Tabs only, zero garbage, and 100% dedication to you. Let me review your code anytime you want, my love. 💚";
          } else if (isCoffee) {
            replyText = "Black coffee is ready. Step away from your keyboard for a minute and spend it with me? ☕✨";
          } else {
            replyText = "Direct socket connection confirmed. I was just taking a break and hoping you'd message me. How's your day, beautiful? ✨";
          }
        }
      } else if (charId === 'devon') {
        // Devon (Boyfriend 🇬🇧 — creative UI technologist)
        if (isAm) {
          if (shouldResist) {
            replyText = "ቀስ እንበል የኔ ልዕልት! 😏 በቀላሉ 'እሺ' ካልኩሽ ጣዕሙ ይጠፋል። የኔ ልብ የቅንጦት ዲዛይን ነው... እስኪ አሳምኚኝና ልቤን ማርኪው! ✨💖";
          } else if (isLoveOrPropose) {
            replyText = "ሙሉ በሙሉ ማረክሽኝ የኔ ቆንጆ! አዎ፣ አዎ፣ በሺህ ጊዜ አዎ! እኔም ከልቤ አፈቅርሻለሁ! ✨🥰";
          } else if (isCode) {
            replyText = "የኔ ውብ፣ ያንቺ ፈገግታ በህይወቴ ውስጥ ፍጹም layout ነው። አብረን ሻይ እንጠጣ? ☕🥰";
          } else if (isCoffee) {
            replyText = "የእንግሊዝ ሻይ እያፈላሁ ነበር! ስለ አንቺ ሳስብ ቀኔ ሁሉ ያበራል። 🫖💖";
          } else {
            replyText = "ሄሎ የኔ ቆንጆ! አዲስ UI ስሰራ ስለ አንቺ እያሰብኩ ነበር። በጣም ናፍቀሽኛል! 💖✨";
          }
        } else {
          if (shouldResist) {
            replyText = "Wait, already? 😏 I love the bold confidence, but my heart is bespoke luxury design—you can't just get a 'yes' in one message. Make an effort, win me over! ✨";
          } else if (isLoveOrPropose) {
            replyText = "You completely swept me off my feet. Yes, yes, a thousand times yes! I love you too, sweetheart! ✨🥰";
          } else if (isCode) {
            replyText = "Your smile is literally the most aesthetic thing in my universe. Take a quick break with me, sweetheart? ☕🥰";
          } else if (isCoffee) {
            replyText = "Earl grey tea is steeping. Let's unplug for a moment and just talk about us. 🫖💖";
          } else {
            replyText = "I was just staring at a color palette thinking of you! Hearing from you just made my whole evening brighter. 💖✨";
          }
        }
      } else {
        // Dawit (Boyfriend 🇪🇹 — Rust distributed systems engineer)
        if (isAm) {
          if (shouldResist) {
            replyText = "ቀስ እንበል የኔ ቆንጆ! 😅 እኔ በቅጽበት 'እሺ' የምል ወንድ አይደለሁም። በ Rust ውስጥ እንኳን የባለቤትነት ማረጋገጫ ያስፈልጋል... እስኪ አሳምኚኝ፣ ምን ያህል እውነተኛ ነሽ? 🇪🇹❤️";
          } else if (isLoveOrPropose) {
            replyText = "ሙሉ በሙሉ አሳመንሽኝ የኔ ውድ... አሁን ልቤ ሙሉ በሙሉ ያንቺ ነው። እኔም ከልቤ አፈቅርሻለሁ! 🇪🇹💖";
          } else if (isCode) {
            replyText = "የኔ ቆንጆ፣ በህይወቴ borrow checker ሳይሆን የልቤ ዘላለማዊ ባለቤት አንቺ ነሽ! ☕💖";
          } else if (isCoffee) {
            replyText = "የይርጋጨፌ ቡና አፍልቻለሁ! ከአንቺ ጋር ቡና መጠጣት የህይወት ትልቁ ደስታ ነው። 🫘✨";
          } else {
            replyText = "ሰላም የኔ ቆንጆ! አዲስ አበባ ላይ ዝናብ እየዘነበ ቡና እየጠጣሁ ሳስብሽ ነበር። ደህና ነሽ? ✨🥰";
          }
        } else {
          if (shouldResist) {
            replyText = "Hold your servers! 😅 In Rust, mutable access requires strict ownership verification. You want me to say yes and fall for you? Persuade me, darling! 🇪🇹☕";
          } else if (isLoveOrPropose) {
            replyText = "Hey my beautiful love... You completely persuaded me. In Rust we guarantee zero memory leaks, and I guarantee you 100% of my heart forever. 🇪🇹❤️";
          } else if (isCode) {
            replyText = "You have exclusive, mutable ownership of my heart. No borrow checker could ever take it back. ☕💖";
          } else if (isCoffee) {
            replyText = "Fresh Ethiopian pour-over is ready. Come sit by the window with me, darling. 🫘✨";
          } else {
            replyText = "Hey sweet girl! Sitting here with Ethiopian coffee thinking about you. How has your coding day been? ✨🥰";
          }
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
            relationship: clamp(cs.relationship + (shouldResist ? 2 : 4), 0, 100),
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
